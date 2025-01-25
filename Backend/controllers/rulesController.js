const fs = require('fs');
const path = require('path');
const Rule = require('../models/ruleModel');
const RULES_FILE = '/var/lib/suricata/rules/local.rules';
const { exec } = require('child_process');
const parseRule = (raw) => {
    try {
        if (!raw || typeof raw !== 'string') {
            throw new Error('Invalid raw rule data');
        }

        return {
            raw: raw.trim(),
            sid: raw.match(/sid:(\d+);/)?.[1] || "No SID",
            msg: raw.match(/msg:"(.*?)"/)?.[1] || "No Message",
            classtype: raw.match(/classtype:(.*?);/)?.[1] || "No Classtype"
        };
    } catch (err) {
        console.error('Error parsing rule:', err);
        return null; // Trả về null nếu không phân tích được
    }
};
// write all active rules to local.rules file
const writeRulesToFile = async () => {
    try {
        const activeRules = await Rule.find({ isActive: true });
        const ruleStrings = activeRules.map((rule) => rule.raw);
        await fs.promises.writeFile(RULES_FILE, ruleStrings.join('\n'));
        exec('sudo systemctl restart suricata', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    } catch (err) {
        console.error('Error writing rules to file:', err);
    }
};
exports.getRules = async (req, res) => {
    try {
        const rules = await Rule.find();
        res.status(200).json(rules);
    } catch (err) {
        console.error('Error fetching rules:', err);
        res.status(500).json({ message: 'Failed to fetch rules' });
    }
};

exports.addRule = async (req, res) => {
    const { raw } = req.body;

    if (!raw || typeof raw !== 'string') {
        return res.status(400).json({ message: 'Invalid rule data' });
    }

    const parsedRule = parseRule(raw);
    if (!parsedRule || !parsedRule.sid || !parsedRule.msg) {
        return res.status(400).json({ message: 'Rule must have valid SID and message' });
    }

    try {
        // Kiểm tra xem SID đã tồn tại chưa
        const existingRule = await Rule.findOne({ sid: parsedRule.sid });
        if (existingRule) {
            return res.status(400).json({ message: 'A rule with this SID already exists' });
        }

        // Tạo rule mới trong database
        const newRule = new Rule(parsedRule); 
        await newRule.save();
        writeRulesToFile();

        res.status(200).json({ message: 'Rule added successfully', rule: newRule });
    } catch (err) {
        console.error('Error adding rule:', err);
        res.status(500).json({ message: 'Failed to add rule' });
    }
};

exports.updateRule = async (req, res) => {
    const { raw } = req.body;
    const { sid } = req.params;

    if (!raw || typeof raw !== 'string') {
        return res.status(400).json({ message: 'Invalid rule data' });
    }

    const parsedRule = parseRule(raw); // Sử dụng hàm parseRule để trích xuất thông tin
    if (!parsedRule || !parsedRule.sid || !parsedRule.msg) {
        return res.status(400).json({ message: 'Rule must have valid SID and message' });
    }

    try {
        // Tìm và cập nhật rule trong database dựa trên SID
        const updatedRule = await Rule.findOneAndUpdate(
            { sid }, // Tìm rule theo SID
            parsedRule, // Cập nhật các trường đã parse (bao gồm raw)
            { new: true } // Trả về bản ghi đã cập nhật
        );
        writeRulesToFile();

        if (!updatedRule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        res.status(200).json({ message: 'Rule updated successfully', rule: updatedRule });
    } catch (err) {
        console.error('Error updating rule:', err);
        res.status(500).json({ message: 'Failed to update rule' });
    }
};

exports.deleteRule = async (req, res) => {
    const { sid } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!sid) {
        return res.status(400).json({ message: 'SID is required to delete a rule' });
    }

    try {
        // Xóa rule theo SID
        const deletedRule = await Rule.findOneAndDelete({ sid });

        if (!deletedRule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        writeRulesToFile();
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (err) {
        console.error('Error deleting rule:', err);
        res.status(500).json({ message: 'Failed to delete rule' });
    }
};
exports.enableRule = async (req, res) => {
    const { sid } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!sid) {
        return res.status(400).json({ message: 'SID is required to enable a rule' });
    }

    try {
        // Xóa rule theo SID
        const activeRule = await Rule.findOneAndUpdate({ sid }, { isActive: true });

        if (!activeRule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        writeRulesToFile();

        res.status(200).json({ message: 'Rule active successfully' });
    } catch (err) {
        console.error('Error active rule:', err);
        res.status(500).json({ message: 'Failed to active rule' });
    }
};
exports.disableRule = async (req, res) => {
    const { sid } = req.params;

    // Kiểm tra dữ liệu đầu vào
    if (!sid) {
        return res.status(400).json({ message: 'SID is required to deactive a rule' });
    }

    try {
        // Xóa rule theo SID
        const deactiveRule = await Rule.findOneAndUpdate({ sid }, { isActive: false });

        if (!deactiveRule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        writeRulesToFile();
        res.status(200).json({ message: 'Rule deactive successfully' });
    } catch (err) {
        console.error('Error deactive rule:', err);
        res.status(500).json({ message: 'Failed to deactive rule' });
    }
};


