import React, { useEffect, useState } from "react";
import { Table, Input, Button, message, Tag, Select, Dropdown, Menu } from "antd";
import { PlusOutlined, FilterOutlined, DeleteOutlined, DownCircleOutlined, UpCircleOutlined, MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { Modal } from "antd";


const { Option } = Select;
const { TextArea } = Input; // Import TextArea for multi-line input

const Rule = () => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [newRule, setNewRule] = useState(""); // Rule mới
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasstype, setFilterClasstype] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [visible, setVisible] = useState(false); // Filter dropdown visibility
  const [expandedRowKeys, setExpandedRowKeys] = useState(null); // Only one expanded row at a time
  const [editingRule, setEditingRule] = useState(null); // State to track the rule being edited

  // Fetch rules
  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/rules");
      setRules(data);
    } catch (err) {
      message.error("Failed to fetch rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Filtered rules based on search term, classtype, and status
  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.msg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClasstype = filterClasstype ? rule.classtype === filterClasstype : true;
    const matchesStatus =
      filterStatus === "Active"
        ? rule.isActive
        : filterStatus === "Inactive"
          ? !rule.isActive
          : true;
    return matchesSearch && matchesClasstype && matchesStatus;
  });

  // Handle delete selected
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedRowKeys.map((key) => axios.delete(`/rules/${key}`)));
      setRules(rules.filter((rule) => !selectedRowKeys.includes(rule.sid)));
      message.success("Selected rules deleted successfully");
      setSelectedRowKeys([]);
    } catch (err) {
      message.error("Failed to delete selected rules");
    }
  };

  // Handle update rule
  const handleSave = async (sid, updatedRule) => {
    try {
      await axios.put(`/rules/${sid}`, updatedRule);
      setRules(
        rules.map((rule) =>
          rule.sid === sid ? { ...rule, ...updatedRule } : rule
        )
      );
      message.success("Rule updated successfully");
      setExpandedRowKeys(null); // Close the expanded row after update
      setEditingRule(null); // Reset the editing rule state
    } catch (err) {
      message.error("Failed to update rule");
    }
  };

  // Handle change in the rule raw data (for editing)
  const handleRawChange = (e, rule) => {
    const updatedRule = { ...rule, raw: e.target.value };
    setEditingRule(updatedRule);
  };

  // Render raw editable form for rule
  const renderRawForm = (record) => {
    const isEditing = editingRule && editingRule.sid === record.sid;
    return (
      <div>
        <TextArea
          value={isEditing ? editingRule.raw : record.raw}
          onChange={(e) => handleRawChange(e, record)}
          style={{
            marginBottom: 8,
            fontSize: "16px", // Adjust font size for better readability
            fontFamily: "monospace", // Monospace for better code readability
            width: "100%",
            height: "100px", // Make it bigger for easier viewing
            whiteSpace: "pre-wrap", // Allows wrapping of long lines
            wordWrap: "break-word", // Break long words
          }}
        />
        <Button
          type="primary"
          onClick={() => handleSave(record.sid ,editingRule || record)} // Save the rule
          style={{ fontSize: "16px", marginTop: "8px" }}
        >
          Save
        </Button>
      </div>
    );
  };

  // Toggle expand state for raw details
  const handleExpand = (key) => {
    // If the same row is clicked, collapse it, otherwise expand the new row
    setExpandedRowKeys(expandedRowKeys === key ? null : key);
  };
  // Handle dropdown menu actions
  const handleAction = async (action, record) => {
    try {
      switch (action) {
        case "toggle":
          // Đổi trạng thái rule
          if (record.isActive) {
          await axios.put(`/rules/disable/${record.sid}`);
          setRules( rules.map((rule) => rule.sid === record.sid ? { ...rule, isActive: false } : rule));
          message.success("Rule disabled successfully");
          } else {
          await axios.put(`/rules/enable/${record.sid}`);
          setRules( rules.map((rule) => rule.sid === record.sid ? { ...rule, isActive: true } : rule));
          message.success("Rule enabled successfully");
          }
          break;

        case "delete":
          // Xóa rule
          await axios.delete(`/rules/${record.sid}`);
          setRules(rules.filter((rule) => rule.sid !== record.sid));
          message.success("Rule deleted successfully");
          break;

        default:
          message.info("Invalid action");
      }
    } catch (error) {
      message.error("An error occurred while processing the action");
    }
  };
  // Hiển thị modal
  const showAddRuleModal = () => {
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setNewRule(""); // Reset rule khi đóng
  };

  // Xử lý thêm rule
  const handleAddRule = async () => {
    try {
      if (!newRule.trim()) {
        message.error("Rule cannot be empty!");
        return;
      }

      const response = await axios.post("/rules", { raw: newRule });
      const addedRule = response.data.rule;
      console.log(addedRule);

      setRules((prevRules) => [...prevRules, addedRule]);
// Cập nhật danh sách rules
      message.success("Rule added successfully!");
      setIsModalVisible(false); // Đóng modal
      setNewRule(""); // Reset rule
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add rule");
    }
  };



  const filterMenu = (
    <Menu>
      <Menu.Item key="classtype">
        <Select
          placeholder="Filter by classtype"
          onChange={(value) => setFilterClasstype(value)}
          allowClear
          style={{ width: "100%" }}
        >
          {[...new Set(rules.map((rule) => rule.classtype))].map((classtype) => (
            <Option key={classtype} value={classtype}>
              {classtype}
            </Option>
          ))}
        </Select>
      </Menu.Item>
      <Menu.Item key="status">
        <Select
          placeholder="Filter by status"
          onChange={(value) => setFilterStatus(value)}
          allowClear
          style={{ width: "100%" }}
        >
          <Option value="Active">Enabled</Option>
          <Option value="Inactive">Disabled</Option>
        </Select>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "SID",
      dataIndex: "sid",
      key: "sid",
      align: "center",
    },
    {
      title: "Message",
      align: "center",
      dataIndex: "msg",
      key: "msg",
    },
    {
      title: "Classtype",
      dataIndex: "classtype",
      key: "classtype",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Enabled" : "Disabled"}</Tag>
      ),
    },
    {
      title: "Details",
      key: "details",
      align: "center",
      render: (_, record) => (
        <Button
          icon={
            expandedRowKeys === record.sid
              ? <UpCircleOutlined />
              : <DownCircleOutlined />
          }
          onClick={() => handleExpand(record.sid)}
          style={{ border: "none" }} // Remove button border
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const menu = (
          <Menu
            onClick={({ key }) => handleAction(key, record)}
            items={[
              {
                key: "toggle",
                label: record.isActive ? "Disable" : "Enable", // Hiển thị nút phù hợp
              },
              {
                key: "delete",
                label: "Delete", // Xóa rule
              },
            ]}
          />
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} style={{ border: "none" }} />
          </Dropdown>
        );
      },
    },


  ];

  return (
    <div style={{ margin: "20px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddRuleModal}
        >
          Add Rule
        </Button>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Dropdown
            overlay={filterMenu}
            visible={visible}
            onVisibleChange={(flag) => setVisible(flag)}
            trigger={["click"]}
          >
            <Button icon={<FilterOutlined />} />
          </Dropdown>
          <Input
            placeholder="Search rules"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300, marginLeft: 8 }}
          />
        </div>
      </div>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        }}
        columns={columns}
        dataSource={filteredRules}
        rowKey="sid"
        loading={loading}
        pagination={{ pageSize: 6 }}
        expandedRowKeys={expandedRowKeys ? [expandedRowKeys] : []} // Only one expanded row at a time
        onExpand={(expanded, record) => handleExpand(record.sid)}
        expandedRowRender={(record) => renderRawForm(record)} // Only show raw data
      />

      {selectedRowKeys.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, marginRight: 16 }}>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteSelected}
            style={{ marginLeft: "auto" }}
          >
            Delete Selected
          </Button>
        </div>

      )}
      <Modal
        title="Add New Rule"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleAddRule}
        okText="Add"
        cancelText="Cancel"
        width={600}
      >
        <TextArea
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Enter rule here..."
          style={{
            fontSize: "16px",
            fontFamily: "monospace",
            width: "100%",
            height: "100px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
      </Modal>

    </div>
  );
};

export default Rule;
