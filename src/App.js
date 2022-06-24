import './App.css';
import { SearchOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Modal, Timeline } from 'antd';
import { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Tabs } from 'antd';
import axios from 'axios';

const BaseUrl = 'http://localhost:8080/api';
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

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [students, setStudents] = useState([]);
  const [votedStudents, setVoteStudents] = useState([]);

  const [isVotedModalVisible, setIsVotedModalVisible] = useState(false);
  const [currentVotedStudent, setCurrentVotedStudent] = useState({});

  useEffect(() => {
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
  }, []);

  const onChangeTab = (key) => {
    console.log('Change to tab ', key);
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
    }
  ];

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

  return (<div>
    <Tabs defaultActiveKey="1" onChange={onChangeTab}>
      <TabPane tab="Danh Sách" key="1">
        <Table columns={columns} dataSource={students}/>
      </TabPane>
      <TabPane tab="Kết Quả" key="2">
        <Table columns={votedColumns} dataSource={votedStudents}/>
      </TabPane>
    </Tabs>

    <Modal title="Lịch sử ghi nhận" visible={isVotedModalVisible}
           onOk={handleVotedModalOk} onCancel={handleVotedModalCancel}>
      <VoteTimeline votes={currentVotedStudent.votes || []}/>
    </Modal>
  </div>);
};

const VoteTimeline = ({ votes }) => {
  if (!votes.length) {
    return (<div>Chưa có dữ liệu</div>);
  }
  return (
      <Timeline>
        {
          votes.map(vote => {
            // <Timeline.Item color="#00CCFF" dot={<SmileOutlined/>}>
            //   <p>Custom color testing</p>
            // </Timeline.Item>
            return (
                <Timeline.Item color="#002766">
                  Được ghi nhận về tiêu chí <b>{CriteriaTypeTitle[vote.type]}</b>
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