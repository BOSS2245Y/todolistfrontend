// Install necessary packages:
// npm install react-bootstrap bootstrap

import React, { useState ,useEffect} from 'react';
import axios from "axios"

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Navbar, Nav, Modal } from 'react-bootstrap';

const BASE_URL = 'https://todolist-eu2f.onrender.com';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const fetchTasks = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/api/v1/tasks/getAllTasks`);
  //     console.log('Fetched tasks response:', response);
  //     const { accessToken } = response.data;

  //     // Store token in localStorage
  //     localStorage.setItem("accessToken", accessToken);
      
  
  //     if (response.data && Array.isArray(response.data.data)) {
  //       setTasks(response.data.data); // Ensure only the array is set
  //     } else {
  //       console.error('Invalid response format:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching tasks:', error);
  //   }
  // };

  const fetchTasks = async () => {
    try {
      // Retrieve the token from localStorage
      const accessToken = localStorage.getItem("accessToken");
  
      // If no token is available, you could handle it here, e.g., redirect to login
      if (!accessToken) {
        console.log("No access token found, redirecting to login");
        
        return;
      }
  
      // Add the token to the Authorization header
      const response = await axios.get(`${BASE_URL}/api/v1/tasks/getAllTasks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Attach token to the request
        },
      });
  
      console.log("Fetched tasks response:", response);
  
      // If tasks data is available and properly formatted, set them
      if (response.data && Array.isArray(response.data.data)) {
        setTasks(response.data.data); // Store tasks in state
      } else {
        console.error("Invalid response format:", response);
      }
    } catch (error) {
      // Error handling, in case the token is invalid or expired
      console.error("Error fetching tasks:", error);
      if (error.response && error.response.status === 401) {
        // Token might have expired, redirect to login
        console.log("Unauthorized access, please login again.");
       
      }
    }
  };
  useEffect((isLoggedIn) => {
    fetchTasks();
  }, [isLoggedIn]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: '',
  });
  
  const [loginForm, setLoginForm] = useState({ username: '', email:"", password: '' });
  const [showLoginModal, setShowLoginModal] = useState(true);
  
  // const LoginForm = () => {
  //   const [formData, setFormData] = useState({ username:"" ,email: "", password: "" });
  //   const [message, setMessage] = useState("");
  
  //   const handleLoginChange = (e) => {
  //     const { name, value } = e.target;
  //     setLoginForm({ ...loginForm, [name]: value });
  //   };
  
  //   const handleLogin = async (e) => {
  //     e.preventDefault();
  //     try {
  //       const response = await axios.post("/api/v1/users/login", formData);
  //       setMessage(response.data.message);
  //       if(response){
  //         setIsLoggedIn(true);
  //         setShowLoginModal(false);

  //       }
  //       else {
  //         alert('Invalid credentials');
  //       }
  //       console.log("Token:", response.data.token); // Store token securely
  //     } catch (error) {
  //       if (error.response) {
  //         setMessage(error.response.data.message);
  //       } else {
  //         setMessage("Something went wrong!");
  //       }
  //     }
  //   };

 

  const handleLoginChange = (e) => {
        const { name, value } = e.target;
         setLoginForm({ ...loginForm, [name]: value });
       };

  
  

  // const handleLogin = async () => {
  //   const { username,email, password } = loginForm;
  
  //   try {
  //     const response = await axios.post('http://localhost:8000/api/v1/users/login', { username,email, password });
  //     console.log('Login successful:', response.data);
  //     setIsLoggedIn(true);
  //     setShowLoginModal(false);
  //   } catch (error) {
  //     if (error.response && error.response.status === 404) {
  //       alert('API endpoint not found.');
  //     } else {
  //       alert('Login failed. Please check your credentials or try again later.');
  //     }
  //   }
  // };

  const handleLogin =  async () => {
    
    const { usernameOrEmail , password } = loginForm;
    if(!usernameOrEmail || !password){
      return alert("feilds are required")
    }
        try{
          
          // const response = await axios.post(`${BASE_URL}/api/v1/users/login`, {
          //   usernameOrEmail, // Dynamically set field based on input
          //   password: password,
          // });

          const url=`${BASE_URL}/api/v1/users/login`;
          const response =await fetch(url,{
            method:"POST",
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify(loginForm)
          })
          
          console.log('Login successful:', response.data);
          if (response.status === 200) {
            // Handle successful login
            const { accessToken } = response.accessToken;

        // Store token in localStorage
        localStorage.setItem("accessToken", accessToken);
            setIsLoggedIn(true);
            setShowLoginModal(false);
            alert(response.message);
          } else {
            // Handle unexpected response
            alert('Unexpected response from server');
          }
        
          
        
        } catch (error) {
          // Handle error (e.g., invalid credentials, network error, etc.)
          if (error.response && error.response.status === 400) {
            alert('Invalid username or password');
          } else {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
          }
        }

  };

  const handleLogout = async () => {

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/users/logout`)
      console.log('Logout successful:', response.data)
      if (response.status === 200) {
        // Handle successful logout
        
        setIsLoggedIn(false);
        setLoginForm({ username: '', password: '' });
        setShowLoginModal(true);
      } else {
        // Handle unexpected response
        alert('Unexpected response from server');
      }
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Invalid username or password');
      } else {
        console.error('Error during logout:', error);
        alert('An error occurred. Please try again later.');
      }
      
    }


    
    
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTask = async () => {
    

    if(editingTaskId){
    
    
    
      try {
        console.log('Updated Task Payload:', formData);
        
    
        const response = await axios.patch(
          `${BASE_URL}/api/v1/tasks/update/${editingTaskId}`,
          formData
        );
        console.log('API Response:', response.data);
    
        if (response.data.success) {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === editingTaskId ? response.data.data : task
            )
          );
          
        } else {
          console.error('Failed to update task:', response.data.message);
        }
      } catch (error) {
        if (error.response) {
          console.error('Backend error response:', error.response.data);
        } else {
          console.error('Error updating task:', error.message);
        }
        alert('An error occurred while updating the task.');
      }
         
    
    }else{
      const { title,description , category,dueDate } = formData;
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/tasks/add`, {
        title,
        description,
        category,
        dueDate,
      });
  
      if (response.status === 201 && response.data.data) {
        console.log('Task added successfully:', response.data.data);
        setTasks((prevTasks) => {
          if (!Array.isArray(prevTasks)) {
            console.error('Previous tasks state is not an array:', prevTasks);
            return [response.data.data]; // Fallback to ensure valid state
          }
          return [...prevTasks, response.data.data];
        });
        setFormData({ title: '', description: '', category: '', dueDate: '' });
        alert('Task added successfully');
      } else {
        alert('Unexpected response from server');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Fields are required');
      } else {
        console.error('Error during task addition:', error);
        alert('An error occurred. Please try again later.');
      }
    }
  }
      
    
    
  };

  const [editingTaskId, setEditingTaskId] = useState(null); // Tracks the task being edited
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormData({ title: '', description: '', category: '', dueDate: '' });
  };
  

  
    
  
  const handleEditButtonClick = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    setFormData({
      title: taskToEdit.title,
      description: taskToEdit.description,
      category: taskToEdit.category,
      dueDate: taskToEdit.dueDate,
    });
    setEditingTaskId(taskToEdit._id);
  };
  
  

  const handleDeleteTask = async (id) => {
    console.log('Deleting task with id:', id);
    if (!id) {
      console.error('Task ID is undefined or invalid.');
      alert('Task ID is missing. Cannot delete task.');
      return;
    }
    try {
      const response = await axios.delete(`${BASE_URL}api/v1/tasks/delete/${id}`);
      if (response.status === 200) {
        alert('Task deleted successfully');
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      } else {
        console.error('Failed to delete task:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  const [isRegistering, setIsRegistering] = useState(false);

const [registerForm, setRegisterForm] = useState({
  username: "",
  email: "",
  password: "",
});

const handleRegisterChange = (e) => {
  const { name, value } = e.target;
  
  setRegisterForm({ ...registerForm, [name]:value });
};

const handleRegister = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/users/register`, registerForm);
    alert(response.data.message);
    setIsRegistering(false); // Switch back to login after registering
  } catch (error) {
    console.error("Error registering:", error);
    alert(error.response?.data?.message || "Registration failed");
  }
};


  if (!isLoggedIn) {
    return (
      <Modal show={showLoginModal} centered>
  <Modal.Header>
    <Modal.Title>{isRegistering ? "Register" : "Login"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {isRegistering ? (
      // Registration Form
      <Form>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={registerForm.username}
            onChange={handleRegisterChange}
            placeholder="Enter username"
          />
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={registerForm.email}
            onChange={handleRegisterChange}
            placeholder="Enter email"
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
            placeholder="Enter password"
          />
        </Form.Group>
      </Form>
    ) : (
      // Login Form
      <Form>
        <Form.Group controlId="formUsernameOrEmail">
          <Form.Label>Username or Email</Form.Label>
          <Form.Control
            type="text"
            name="usernameOrEmail"
            value={loginForm.usernameOrEmail}
            onChange={handleLoginChange}
            placeholder="Enter username or email"
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            placeholder="Enter password"
          />
        </Form.Group>
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    {isRegistering ? (
      <>
        <Button variant="primary" onClick={handleRegister}>Register</Button>
        <Button variant="secondary" onClick={() => setIsRegistering(false)}>Back to Login</Button>
      </>
    ) : (
      <>
        <Button variant="primary" onClick={handleLogin}>Login</Button>
        <Button variant="link" onClick={() => setIsRegistering(true)}>Register if New</Button>
      </>
    )}
  </Modal.Footer>
</Modal>

    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-3 px-3">
        <Navbar.Brand href="#" className="me-auto">TODO LIST</Navbar.Brand>
        <Nav className="ms-auto">
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </Nav>
      </Navbar>

      <Row>
        {/* Sidebar */}
        <Col sm={4} className="bg-light p-3">
          <h5>Add Task</h5>
          <Form>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
              />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
              />
            </Form.Group>

            <Form.Group controlId="formCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="work">Work</option>
                <option value="urgent">Urgent</option>
                <option value="personal">Personal</option>
                <option value="others">Others</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="d-flex  gap-2 mb-2">
            <Button variant="success" onClick={handleAddTask} className="mt-2">
            {editingTaskId ? 'Save Edit' : 'Add Task'}
            </Button>
            {editingTaskId && (
              <Button variant='secondary' className="mt-2 custom-margin-left" onClick={handleCancelEdit}>
                      Cancel
              </Button>
            )}
            </div>
          </Form>
        </Col>

        {/* Main Content */}
        <Col sm={8}>
          <h5>Task List</h5>
          <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
            <ul className="list-group">
              {(Array.isArray(tasks) ? tasks : []).map((task) => (
                <li
                  key={task._id}
                  className="list-group-item mb-2"
                  style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 style={{ fontWeight: 'bold' }}>{task.title}</h6>
                      <hr className="my-2" />
                      <p>{task.description}</p>
                      <small>Category: {task.category}</small>
                      <br />
                      <small>Due Date: {task.dueDate}</small>
                    </div>
                    <div>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditButtonClick(task._id)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App ;
