// Install necessary packages:
// npm install react-bootstrap bootstrap

import React, { useState, useEffect } from 'react';
import axios from "axios";

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Navbar, Nav, Modal } from 'react-bootstrap';

const BASE_URL = 'https://todolist-eu2f.onrender.com';

function App() {
  // State Hooks
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: '',
  });
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [editingTaskId, setEditingTaskId] = useState(null); // Tracks the task being edited
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch tasks when `isLoggedIn` changes
  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  // Helper Functions
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/tasks/getAllTasks`, { withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setTasks(response.data.data);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    const { usernameOrEmail, password } = loginForm;
    if (!usernameOrEmail || !password) {
      return alert("Fields are required");
    }
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/users/login`, {
        usernameOrEmail,
        password,
      }, { withCredentials: true });

      if (response.status === 200) {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        alert(response.data.message);
      } else {
        alert('Unexpected response from server');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Invalid username or password');
      } else {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
      }
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/users/register`, registerForm, { withCredentials: true });
      alert(response.data.message);
      setIsRegistering(false); // Switch back to login after registering
    } catch (error) {
      console.error("Error registering:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/users/logout`, {}, { withCredentials: true });
      if (response.status === 200) {
        setIsLoggedIn(false);
        setLoginForm({ username: '', password: '' });
        setShowLoginModal(true);
      } else {
        alert('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleAddTask = async () => {
    const { title, description, category, dueDate } = formData;
    try {
      const response = editingTaskId
        ? await axios.patch(`${BASE_URL}/api/v1/tasks/update/${editingTaskId}`, formData, { withCredentials: true })
        : await axios.post(`${BASE_URL}/api/v1/tasks/add`, { title, description, category, dueDate }, { withCredentials: true });

      if (response.status === (editingTaskId ? 200 : 201) && response.data.data) {
        setTasks((prevTasks) => {
          return editingTaskId
            ? prevTasks.map((task) => task._id === editingTaskId ? response.data.data : task)
            : [...prevTasks, response.data.data];
        });
        setEditingTaskId(null);
        setFormData({ title: '', description: '', category: '', dueDate: '' });
        alert(`Task ${editingTaskId ? 'updated' : 'added'} successfully`);
      } else {
        alert('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error during task operation:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/tasks/delete/${id}`, { withCredentials: true });
      if (response.status === 200) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        alert('Task deleted successfully');
      } else {
        alert('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('An error occurred while deleting the task.');
    }
  };

  const handleEditButtonClick = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        description: taskToEdit.description,
        category: taskToEdit.category,
        dueDate: taskToEdit.dueDate,
      });
      setEditingTaskId(taskToEdit._id);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormData({ title: '', description: '', category: '', dueDate: '' });
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
