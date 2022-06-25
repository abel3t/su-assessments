import './App.css';
import { SearchOutlined, SmileOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  Timeline,
  Select,
  message,
  Col, Row
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Tabs } from 'antd';
import axios from 'axios';

const BaseUrl = 'https://su-api.vercel.app/api';
const { TabPane } = Tabs;

const CriteriaTypeTitle = {
  GoodStudy: 'Học tập giỏi',
  PlayHard: 'Chơi hết mình',
  EatWellSleepWell: 'Ăn giỏi, ngủ ngoan',
  Skillfully: 'Khéo tay hay làm',
  Humorous: 'Vui vẻ hài hước',
  NiceWords: 'Nói lời hay',
  GoodDiscipline: 'Kỷ luật tốt',
  Serve: 'Sẵn lòng phục vụ',
  BeautifulSingOrDancing: 'Hát hay múa đẹp',
  Sociable: 'Hòa đồng hợp tác'
};

const CriteriaTypeColor = {
  GoodStudy: '#2f54eb',
  PlayHard: '#722ed1',
  EatWellSleepWell: '#eb2f96',
  Skillfully: '#faad14',
  Humorous: '#b7eb8f',
  NiceWords: '#87e8de',
  GoodDiscipline: '#bae637',
  Serve: '#389e0d',
  BeautifulSingOrDancing: '#08979c',
  Sociable: '#0050b3'
};

const { Option } = Select;

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [students, setStudents] = useState([]);
  const [votedStudents, setVoteStudents] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({});
  const [isVotedModalVisible, setIsVotedModalVisible] = useState(false);
  const [currentVotedStudent, setCurrentVotedStudent] = useState({});
  const [voteCriteria, setVoteCriteria] = useState('');
  const [tab, setTab] = useState(null);

  useEffect(() => {
    console.log('call api');
    axios.get(BaseUrl + '/students')
        .then(res => {
          if (res.data && res.data.data) {
            setStudents(res.data.data);
          }
        })
        .catch(error => {
          console.log(error);
        });

    axios.get(BaseUrl + '/results')
        .then(res => {
          if (res.data && res.data.data) {
            setVoteStudents(res.data.data);
          }
        })
        .catch(error => {
          console.log(error);
        });
  }, [tab]);

  const onCriteriaChange = (value) => {
    setVoteCriteria(value);
  };

  const onChangeTab = (key) => {
    setTab(key);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
        <div
            style={{
              padding: 8
            }}
        >
          <Input
              ref={searchInput}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(
                  e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm,
                  dataIndex)}
              style={{
                marginBottom: 8,
                display: 'block'
              }}
          />
          <Space>
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined/>}
                size="small"
                style={{
                  width: 90
                }}
            >
              Search
            </Button>
            <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{
                  width: 90
                }}
            >
              Reset
            </Button>
            <Button
                type="link"
                size="small"
                onClick={() => {
                  confirm({
                    closeDropdown: false
                  });
                  setSearchText(selectedKeys[0]);
                  setSearchedColumn(dataIndex);
                }}
            >
              Filter
            </Button>
          </Space>
        </div>
    ),
    filterIcon: (filtered) => (
        <SearchOutlined
            style={{
              color: filtered ? '#1890ff' : undefined
            }}
        />
    ),
    onFilter: (value, record) =>
        record[dataIndex].toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
        searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        ) : (
            text
        )
  });

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: '10%'
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      ...getColumnSearchProps('name')
    },
    {
      title: 'Lớp',
      dataIndex: 'classroomName',
      key: 'classroomName',
      width: '30%',
      ...getColumnSearchProps('classroomName')
    },
    {
      title: 'Ghi nhận',
      key: 'action',
      align: 'center',
      render: (_, record) => (
          <Space size="middle">
            <Button type="primary" onClick={() => showModal(record)}>
              Ghi nhận
            </Button>
          </Space>
      )
    }
  ];
  const showModal = (currentUser) => {
    setVoteCriteria(null);
    setCurrentStudent(currentUser);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!voteCriteria || !currentStudent || !currentStudent.classroomId) {
      message.error('Đã xảy ra lỗi! vui lòng thử lại sau!');
    }
    const { classroomId, _id: studentId } = currentStudent;

    axios.post(
        BaseUrl + `/classrooms/${classroomId}/students/${studentId}/vote`)
        .then(() => message.success('Đã ghi nhận thành công!'))
        .catch(
            () => message.error('Ghi nhận xảy ra lỗi! vui lòng thử lại sau!'));

    setVoteCriteria('');
    setCurrentStudent({});
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setCurrentStudent({});
    setIsModalVisible(false);
  };

  const votedColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: '10%'
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      ...getColumnSearchProps('name')
    },
    {
      title: 'Lớp',
      dataIndex: 'classroomName',
      key: 'classroomName',
      width: '30%',
      ...getColumnSearchProps('classroomName')
    },
    {
      title: 'Lượt bình chọn',
      dataIndex: 'totalVotes',
      key: 'totalVotes',
      ...getColumnSearchProps('totalVotes'),
      sorter: (a, b) => a.totalVotes - b.totalVotes,
      sortDirections: ['descend', 'ascend']
    },
    {
      title: 'Chi tiết',
      key: 'action',
      align: 'center',
      render: (_, record) => (
          <Space size="middle">
            <Button type="primary" onClick={() => showVotedModal(record)}>
              Xem chi tiết
            </Button>
          </Space>
      )
    }
  ];
  const showVotedModal = (currentVotedUser) => {
    setCurrentVotedStudent(currentVotedUser);
    setIsVotedModalVisible(true);
  };

  const handleVotedModalOk = () => {
    setCurrentVotedStudent({});
    setIsVotedModalVisible(false);
  };

  const handleVotedModalCancel = () => {
    setCurrentVotedStudent({});
    setIsVotedModalVisible(false);
  };

  return (<div className="App">
    <h1>Trại Hè SU 2022</h1>
    <Tabs defaultActiveKey="1" onChange={onChangeTab}>
      <TabPane tab="Danh Sách" key="1">
        <Table columns={columns} dataSource={students}/>
        <Modal title="Ghi nhận" visible={isModalVisible}
               onOk={handleModalOk} onCancel={handleModalCancel}
               okButtonProps={{ disabled: !voteCriteria }}
               okText="Lưu ghi nhận"
               cancelText="Trở về"
        >
          <Row>
            <Col span={16}>
              <div>
                Ghi nhận cho em <b>{currentStudent.name} </b> về tiêu chí:
              </div>
            </Col>
            <Col span={8}>
              <Select
                  placeholder="Tiêu chí ghi nhận"
                  onChange={onCriteriaChange}
                  allowClear
                  value={voteCriteria || null}
              >
                {Object.entries(CriteriaTypeTitle)
                    .map(([key, criteria]) => <Option
                        value={key} key={key}>{criteria}</Option>)}
              </Select>
            </Col>
          </Row>

        </Modal>
      </TabPane>
      <TabPane tab="Kết Quả" key="2">
        <Table columns={votedColumns} dataSource={votedStudents}/>
        <Modal title="Lịch sử ghi nhận" visible={isVotedModalVisible}
               onOk={handleVotedModalOk} onCancel={handleVotedModalCancel}
               cancelText="Trở về"
        >
          <VoteTimeline votes={currentVotedStudent.votes || []}/>
        </Modal>
      </TabPane>
    </Tabs>
  </div>);
};

const VoteTimeline = ({ votes }) => {
  if (!votes.length) {
    return (<div>Chưa có dữ liệu</div>);
  }
  return (
      <Timeline>
        {
          votes.map((vote, index) => {
            if (index === votes.length - 1) {
              return (
                  <Timeline.Item color={CriteriaTypeColor[vote.type]}
                                 dot={<SmileOutlined/>}>
                    Được ghi nhận về tiêu
                    chí <b>{CriteriaTypeTitle[vote.type]}</b>
                    {
                        !!vote.dateTime && <span>  vào: {vote.dateTime}</span>
                    }
                  </Timeline.Item>
              );
            }

            return (
                <Timeline.Item color={CriteriaTypeColor[vote.type]}>
                  Được ghi nhận về tiêu
                  chí <b>{CriteriaTypeTitle[vote.type]}</b>
                  {
                      !!vote.dateTime && <span>  vào: {vote.dateTime}</span>
                  }
                </Timeline.Item>);
          })
        }

      </Timeline>
  );
};

export default App;