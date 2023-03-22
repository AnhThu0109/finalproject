import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Button, Space, Modal, Image, Menu, message, Popconfirm, Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words';
import "./style.css";
import "./../style.css"
import { getAllUser, getUserById } from '../../utils/getUser';
import changeFormatDate from '../../utils/formatDate';
import deleteUser from '../../utils/deleteUser';
import { logOut } from '../../utils/logout';
import updateUser from '../../utils/updateUser';
import registerUser from '../../utils/registerUser';

function Students() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    // const collapsed = localStorage.getItem("collapsed");
    const isAdmin = localStorage.getItem("isAdmin");
    const [users, setUsers] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [collapsedContent, setCollapsedContent] = useState(false);
    const [userId, setUserId] = useState();
    const [chosenUser, setChosenUser] = useState();
    const [isDeleted, setIsDeleted] = useState(false);
    const id = localStorage.getItem("userChosenId");
    const loginUserId = localStorage.getItem("id");

    //State for update user
    const [username, setUsername] = useState();
    const [firstname, setFirstname] = useState();
    const [lastname, setLastname] = useState();
    const [phone, setPhone] = useState();
    const [location, setLocation] = useState();
    const [email, setEmail] = useState();
    const [gender, setGender] = useState();
    const [isUpdated, setIsUpdated] = useState(false);

    //Get id of chosen user
    const userChosen = (id) => {
        console.log(id);
        localStorage.setItem("userChosenId", id);
        setUserId(id);
    }

    //Show modal to see user info
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModalSeeInfo = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    //Show modal to update user info
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const showModalUpdate = () => {
        setIsModalUpdateOpen(true);
    };
    const handleOkUpdate = () => {
        setIsModalUpdateOpen(false);
    };
    const handleCancelUpdate = () => {
        setIsModalUpdateOpen(false);
        message.error('Edit request is canceled !!!');
    };

    //Update info user function
    const handleUpdate = async (event) => {
        event.preventDefault();
        let user = {
            "firstname": firstname,
            "lastname": lastname,
            "username": username,
            "email": email,
            "phone": phone,
            "location": location,
            "gender": gender,
        }
        console.log(user);
        try {
            const data = await updateUser(id, token, user);
            console.log(data);
            if (data) {
                setIsUpdated(true);
                handleOkUpdate();
                message.success(`User ${chosenUser?.username} is updated successful !!!`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    //Confirm delete and show message when cancel delete or delete successful
    const confirm = (e) => {
        console.log(e);
        deleteUserById(id, token);
        message.success(`User ${chosenUser?.username} is deleted successful !!!`);
    };
    const cancel = (e) => {
        console.log(e);
        message.error('Delete request is canceled !!!');
    };

    //Show modal to add new user
    const [isModalNewOpen, setIsModalNewOpen] = useState(false);
    const showModalNew = () => {
        setIsModalNewOpen(true);
    };
    const handleOkNew = () => {
        setIsModalNewOpen(false);
    };
    const handleCancelNew = () => {
        setIsModalNewOpen(false);
        message.error('New user request is canceled !!!');
    };

    //State for add new user
    const [username1, setUsername1] = useState();
    const [firstname1, setFirstname1] = useState();
    const [lastname1, setLastname1] = useState();
    const [password1, setPassword1] = useState();
    const [phone1, setPhone1] = useState();
    const [location1, setLocation1] = useState();
    const [email1, setEmail1] = useState();
    const [gender1, setGender1] = useState("Male");
    const [isAddNew, setIsAddNew] = useState(false);

    const handleAddNew = async e => {
        e.preventDefault();
        try {
            let user = {
                "firstname": firstname1,
                "lastname": lastname1,
                "username": username1,
                "email": email1,
                "password": password1,
                "gender": gender1,
                "phone": phone1,
                "location": location1
            }
            const response = await registerUser(user);
            if (response.ok) {
                setIsAddNew(true);
                message.success(`New user is added successful !!!`);
                handleOkNew();
            } else {
                message.error(`Fail when adding new user !!!`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    //Items in dropdown button of each user row
    //For admin
    const items = [
        {
            key: '1',
            label: (
                <Link rel="noopener noreferrer" className='nav-link' onClick={showModalSeeInfo}>
                    See Detail
                </Link>
            ),
        },
        {
            key: '2',
            label: (
                <Link rel="noopener noreferrer" className='nav-link' onClick={showModalUpdate}>
                    Edit
                </Link>
            ),
        },
        {
            key: '3',
            label: (
                <Popconfirm
                    placement=""
                    title="Delete user"
                    description="Are you sure to delete this user?"
                    onConfirm={confirm}
                    onCancel={cancel}
                    okText="Yes"
                    cancelText="No"
                >
                    <Link rel="noopener noreferrer" className='nav-link'>

                        Delete
                    </Link>
                </Popconfirm>
            ),
        },
    ];
    //For normal user
    const itemNormalUser = (
        <Menu>
            <Menu.Item key="1">
                <Link rel="noopener noreferrer" className='nav-link' onClick={showModalSeeInfo}>
                    See Detail
                </Link>
            </Menu.Item>
        </Menu>
    );

    //Delete user
    async function deleteUserById(index, tokenUser) {
        const response = await deleteUser(index, tokenUser)
        if (response.ok) {
            if (loginUserId == index) {
                logOut(token);
                window.location.reload();
                navigate("/login");
            }
            setIsDeleted(true);
            setUserId("");
        } else {

        }
    }

    //For table
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    //Search user
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
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    //Header for table
    const columns = [
        {
            title: 'No.',
            dataIndex: 'key',
        },
        {
            title: 'USERNAME',
            dataIndex: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
            sortDirections: ['ascend', 'descend'],
            ...getColumnSearchProps('username'),
        },
        {
            title: 'GENDER',
            dataIndex: 'gender',
            defaultSortOrder: 'descend',
            filters: [
                {
                    text: 'Male',
                    value: 'Male',
                },
                {
                    text: 'Female',
                    value: 'Female',
                },
            ],
            onFilter: (value, record) => record.gender.indexOf(value) === 0,
        },
        {
            title: 'EMAIL',
            dataIndex: 'email',
            sorter: (a, b) => a.username.localeCompare(b.username),
            sortDirections: ['ascend', 'descend'],
            ...getColumnSearchProps('email'),
        },
        {
            title: 'CREATED AT',
            dataIndex: 'created',
        },
    ];

    //Data for table
    const data = [];
    users?.map((item, index) => {
        let userData = {
            key: `${index + 1}`,
            username: item.username,
            gender: item.gender,
            email: item.email,
            created: isAdmin === false ? (
                <>
                    {changeFormatDate(item.createdAt)} &nbsp;&nbsp;
                    <Dropdown overlay={itemNormalUser} trigger={['click']}>
                        <Button onClick={() => userChosen(item._id)}>
                            <Space>
                                <FontAwesomeIcon icon={faEllipsisVertical} className="text-black" />
                            </Space>
                        </Button>
                    </Dropdown>
                </>

            ) : (
                <>
                    {changeFormatDate(item.createdAt)} &nbsp;&nbsp;
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <Button onClick={() => { userChosen(item._id); }}>
                            <Space>
                                <FontAwesomeIcon icon={faEllipsisVertical} className="text-black" />
                            </Space>
                        </Button>
                    </Dropdown>
                </>

            )
        }
        data.push(userData);
    })

    //Function onChange for table
    const onChangeTable = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        //Get all users
        async function getData() {
            await getAllUser(token)
                .then(data => {
                    console.log(data);
                    setUsers(data);
                })
        }

        //Get user chosen
        async function getUserChosen() {
            await getUserById(userId, token)
                .then(data => {
                    setChosenUser(data);
                    localStorage.setItem("chosenUsername", data.username);
                    console.log("chosen user", data);
                    setUsername(data.username);
                    setFirstname(data.firstname);
                    setLastname(data.lastname);
                    setEmail(data.email);
                    setPhone(data.phone);
                    setLocation(data.location);
                    setGender(data.gender);
                })
        }

        getData();
        if (userId && userId != "") {
            getUserChosen();
        }
        setIsDeleted(false);
        setIsUpdated(false);
        setIsAddNew(false);
    }, [currentPage, collapsedContent, userId, isDeleted, isUpdated, isAddNew])

    return (
        <div className='allAcountContent'>
            <div className='d-flex justify-content-between'>
                <h3 className='px-3 pt-3 mb-0 fw-lighter text-black-50'>Total {users?.length} users.</h3>
                <Link onClick={showModalNew}>
                    <FontAwesomeIcon icon={faUserPlus} className='addUser'></FontAwesomeIcon>
                </Link>
            </div>
            <div className='accountTable'>
                <Table columns={columns} dataSource={data} onChange={onChangeTable} pagination={{ pageSize: 7 }} scroll={{
                    x: 'calc(700px + 50%)',
                }} className='p-3' />
            </div>

            {/* Modal user information */}
            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={[
                <Button key="close" onClick={handleOk} className="okBtnModal fw-bolder">
                    OK
                </Button>,
            ]} className='modalSeeInfo'>
                <div>
                    <Image src={chosenUser?.avatar} className='avatarUserChosen rounded-circle border border-2'></Image>
                    <h4>{chosenUser?.firstname != "" ? (
                        <>{chosenUser?.firstname} {chosenUser?.lastname}</>
                    ) : (<>Unknown</>)}</h4>
                    <div className='row mt-3'>
                        <div className="col-lg-6 col-sm-12 mb-1">
                            <img src="https://cdn-icons-png.flaticon.com/128/9533/9533813.png" className="modalIcon"></img>
                            <span className=''></span>
                            <input className='form-control border border-2 rounded-3 px-4 py-1 ms-3' value={chosenUser?.username} readOnly></input>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                            <img src="https://i.ibb.co/4MSQKGX/Capture-removebg-preview.png" className="modalIcon"></img>
                            <span className=''></span>
                            <input className='form-control border border-2 rounded-3 px-4 py-1 ms-3' value={chosenUser?.gender == null ? ("Unkown") : (chosenUser?.gender)} readOnly></input>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-lg-6 col-sm-12 mb-1">
                            <img src="https://cdn-icons-png.flaticon.com/128/9533/9533772.png" className="modalIcon"></img>
                            <span className=''></span>
                            <input className='form-control border border-2 rounded-3 px-4 py-1 ms-3' value={chosenUser?.email} readOnly></input>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                            <img src="https://cdn-icons-png.flaticon.com/128/9533/9533758.png" className="modalIcon"></img>
                            <span className=''></span>
                            <input className='form-control border border-2 rounded-3 px-4 py-1 ms-3' value={chosenUser?.phone == "" ? ("Unkown") : (chosenUser?.phone)} readOnly></input>
                        </div>
                    </div>
                    <div className="col mb-3">
                        <img src="https://cdn-icons-png.flaticon.com/128/9533/9533739.png" className="modalIcon"></img>
                        <span className=''></span>
                        <input className='form-control border border-2 rounded-3 px-4 py-1 ms-3' value={chosenUser?.location == "" ? ("Unkown") : (chosenUser?.location)} readOnly></input>
                    </div>
                    <p><b>Created at:</b> {changeFormatDate(chosenUser?.createdAt)}</p>
                    <p><b>Last updated at:</b> {changeFormatDate(chosenUser?.updatedAt)}</p>
                </div>
            </Modal>

            {/* Modal update user information */}
            <Modal open={isModalUpdateOpen} onOk={handleOkUpdate} onCancel={handleCancelUpdate} footer={[]}>
                <div>
                    <h4 className='text-center fw-bolder titleEdit'>Account Setting</h4>
                    <div className='row pt-3'>
                        <div className="col-sm-12 col-lg-4 text-center">
                            <Image src={chosenUser?.avatar} className='avatar rounded-circle border border-2 me-sm-3'></Image>
                            <button className='btn btn-secondary mt-lg-3'>Update Avatar</button>
                        </div>
                        <div className="col">
                            <form className="mb-2" onSubmit={handleUpdate}>
                                <div className="row">
                                    <div className="col-sm-12 col-lg-6 mb-2">
                                        <label for="" className="form-label text-secondary">First name</label>
                                        <input type="text" className="form-control border border-2" name="" id="" value={firstname} placeholder="First name" onChange={(e) => setFirstname(e.target.value)}></input>
                                    </div>                   <div className="col mb-2">
                                        <label for="" className="form-label text-secondary">Last name</label>
                                        <input type="text" className="border border-2 form-control" name="" id="" value={lastname} placeholder="Last name" onChange={(e) => setLastname(e.target.value)}></input>
                                    </div>
                                </div>
                                <div className="mb-2">

                                </div>
                                <div className="mb-2">
                                    <label for="" className="form-label text-secondary">Username</label>
                                    <input type="text" className="border border-2 form-control" name="" id="" value={username} placeholder="Username" required onChange={(e) => setUsername(e.target.value)}></input>
                                </div>
                                <div className="mb-2">
                                    <label for="" className="form-label text-secondary">Gender</label>
                                    <select className="border border-2 form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="Male" readOnly>Male</option>
                                        <option value="Female" readOnly>Female</option>
                                    </select>
                                </div>

                                <div className="mb-2">
                                    <label for="" className="form-label text-secondary">Email</label>
                                    <input type="email" className="border border-2 form-control" name="" id="" value={email} placeholder="Email" required onChange={(e) => setEmail(e.target.value)}></input>
                                </div>
                                <div className="mb-2">
                                    <label for="" className="form-label text-secondary">Phone</label>
                                    <input type="tel" className="border border-2 form-control" name="" id="" value={phone} placeholder="0123456789" onChange={(e) => setPhone(e.target.value)} pattern="[0-9]{10}"></input>
                                </div>
                                <div className="mb-2">
                                    <label for="" className="form-label text-secondary">Address</label>
                                    <input type="text" className="border border-2 form-control" name="" id="" value={location} placeholder="Home Address" onChange={(e) => setLocation(e.target.value)}></input>
                                </div>
                                <button type="submit" className="okBtnModal py-2 px-3 mt-3 fw-bolder text-white rounded-3">SAVE CHANGES</button>
                            </form>
                        </div>
                    </div>


                </div>
            </Modal>

            {/* Modal add new user */}
            <Modal open={isModalNewOpen} onOk={handleOkNew} onCancel={handleCancelNew} footer={[]}>
                <div>
                    <h4 className='text-center fw-bolder titleEdit'>Add New User</h4>
                    <div className='row pt-3'>
                        <form className="mb-2" onSubmit={handleAddNew}>
                            <div className="row">
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">First name</label>
                                    <input type="text" className="form-control border border-2" name="" id="" value={firstname1} placeholder="First name" onChange={(e) => setFirstname1(e.target.value)}></input>
                                </div>                   <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Last name</label>
                                    <input type="text" className="border border-2 form-control" name="" id="" value={lastname1} placeholder="Last name" onChange={(e) => setLastname1(e.target.value)}></input>
                                </div>
                            </div>
                            <div className='row'>
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Username</label>
                                    <input type="text" className="border border-2 form-control" name="" id="" value={username1} placeholder="Username" required onChange={(e) => setUsername1(e.target.value)}></input>
                                </div>
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Email</label>
                                    <input type="email" className="border border-2 form-control" name="" id="" value={email1} placeholder="Email" required onChange={(e) => setEmail1(e.target.value)}></input>
                                </div>

                            </div>

                            <div className="row">
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Password</label>
                                    <input type="password" className="border border-2 form-control" name="" id="" value={password1} placeholder="Password" required onChange={(e) => setPassword1(e.target.value)}></input>
                                </div>
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Gender</label>
                                    <select className="border border-2 form-select" value={gender1} onChange={(e) => setGender1(e.target.value)}>
                                        <option value="Male" readOnly>Male</option>
                                        <option value="Female" readOnly>Female</option>
                                    </select>
                                </div>

                            </div>

                            <div className='row'>
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Phone</label>
                                    <input type="tel" className="border border-2 form-control" name="" id="" value={phone1} placeholder="0123456789" onChange={(e) => setPhone1(e.target.value)} pattern="[0-9]{10}"></input>
                                </div>
                                <div className="col-sm-12 col-lg-6 mb-2">
                                    <label for="" className="form-label text-secondary">Address</label>
                                    <input type="text" className="border border-2 form-control" name="" id="" value={location1} placeholder="Home Address" onChange={(e) => setLocation1(e.target.value)}></input>
                                </div>
                            </div>

                            <button type="submit" className="okBtnModal py-2 px-3 mt-3 fw-bolder text-white rounded-3">ADD</button>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default Students;