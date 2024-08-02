// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';

// TASK: import initialData
import { initialData } from "./initialData.js";


// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// Object to store all DOM elements used in the application
// This centralized approach makes it easier to debug DOM-related issues
const elements = {
  sideBar: document.getElementById('side-bar-div'),
  boardsNavLinks: document.getElementById('boards-nav-links-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  layout: document.getElementById('layout'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  columnDivs: document.querySelectorAll('.column-div'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  filterDiv: document.getElementById('filterDiv'),
  switch: document.getElementById('switch'),
  iconDark: document.getElementById('icon-dark'),
  iconLight: document.getElementById('icon-light'),
  modalWindow: document.getElementById('modal-window'), // Assuming this exists based on usage
  tasksContainers: document.querySelectorAll('.tasks-container'),
  boardButtons: document.querySelectorAll('.board-btn'),
  themeToggle: document.querySelector('.toggle-switch-container'),
  form: document.querySelector('#new-task-modal-window form'),
  deleteTaskBtn: document.getElementById('delete-task-btn'), // This might be dynamically created
  body: document.body
}

// Global variable to keep track of the currently active board
// Debugging: Check this variable if board-related functionality isn't working as expected
let activeBoard = "";

// Fetches tasks and displays boards and tasks
// Debugging: This is a key function for initializing the UI
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); // Retrieves tasks from storage
  // Creates a unique list of board names
  // Debugging: If boards are missing, check this line
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    // Sets the active board, prioritizing the one stored in localStorage
    // Debugging: If the wrong board is active, check this logic
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates and displays board buttons in the sidebar
// Debugging: If board buttons are not appearing or misbehaving, check this function
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears existing boards
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    // Adds click event to each board button
    // Debugging: If clicking boards doesn't work, check this event listener
    boardElement.addEventListener('click', () => {  
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters and displays tasks for a specific board
// Debugging: If tasks are not displaying correctly for a board, investigate this function
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  // Filters tasks for the selected board
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Resets column content
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    // Filters tasks by status and creates task elements
    const statusTasks = filteredTasks.filter(task => task.status === status);
    statusTasks.forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Adds click event to open edit modal
      // Debugging: If task editing isn't working, check this event listener
      taskElement.addEventListener("click", () => {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

// Refreshes the UI for the current active board
// Debugging: Call this function if the UI seems out of sync with the data
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board button
// Debugging: If the active board is not visually distinct, check this function
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Adds a new task to the UI
// Debugging: If new tasks are not appearing in the UI, investigate this function
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}

// Sets up all event listeners for the application
// Debugging: If any interactive elements are not working, check this function
function setupEventListeners() {
  elements.cancelAddTaskBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleModal(false, elements.newTaskModalWindow);
    resetNewTaskModal();
  });

  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  elements.switch.addEventListener('change', toggleTheme);

  elements.addNewTaskBtn.addEventListener('click', () => {
    resetNewTaskModal();
    setupNewTaskModal();
    openNewTaskModal();
  });

  elements.newTaskModalWindow.addEventListener('submit', (event) => {
    event.preventDefault();
    if (elements.createTaskBtn.textContent === 'Create Task') {
      addTask(event);
    } else {
      saveTaskChanges(event);
    }
  });
}

// Toggles the visibility of a modal
// Debugging: If modals are not appearing or disappearing correctly, check this function
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

// Opens the modal for creating a new task
function openNewTaskModal() {
  setInputLabels(true);
  setInputStyles();
  setupNewTaskModal();
  toggleModal(true, elements.newTaskModalWindow);
}

// Resets the new task modal to its default state
function resetNewTaskModal() {
  resetInputs();
  resetButtons();
  setInputLabels(true);
}

// Handles the creation of a new task
function addTask(event) {
  event.preventDefault();
  const task = createTaskObject();
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    closeModalAndRefresh(event.target);
  }
}

// Sets up the new task modal
function setupNewTaskModal() {
  setButtonStyles('Create Task', '#219C90', 'Cancel');
  const modalTitle = elements.newTaskModalWindow.querySelector('.modal-title');
  if (modalTitle && modalTitle.textContent === 'Add New Task') {
    elements.cancelAddTaskBtn.style.backgroundColor = '#ea5555';
  }
}

// Toggles the sidebar visibility
function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'flex' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  elements.layout.classList.toggle('no-sidebar', !show);
  localStorage.setItem('showSideBar', show);

  if (show) applySidebarStyles();
}

// Toggles between light and dark themes
function toggleTheme() {
  const isLightTheme = elements.body.classList.toggle('light-theme');
  updateThemeElements(isLightTheme);
  updateLogo(isLightTheme);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

// Opens the modal for editing an existing task
function openEditTaskModal(task) {
  setTaskDetails(task);
  adjustEditModeStyles();
  setupEditButtons(task);
  hideModalTitle();
  toggleModal(true, elements.newTaskModalWindow);
}

// Saves changes made to an existing task
function saveTaskChanges(taskId) {
  const updatedTask = createTaskObject();
  const success = patchTask(taskId, updatedTask);
  if (success) {
    closeModalAndRefresh();
  } else {
    alert('Failed to update task. Please try again.');
  }
}

// Updates an entire task (all fields)
function updateEntireTask(taskId, updatedTask) {
  const success = putTask(taskId, updatedTask);
  
  if (success) {
    refreshTasksUI();
  } else {
    alert('Failed to update the entire task. Please try again.');
  }
}

// Displays a context menu for a task
function showContextMenu(event, task) {
  event.preventDefault();
  const contextMenu = createContextMenu(task);
  positionContextMenu(contextMenu, event);
  addClickOutsideListener(contextMenu);
}

// Shows options for moving a task to a different status
function showMoveOptions(task) {
  const moveModal = createMoveModal(task);
  document.body.appendChild(moveModal);
  addClickOutsideListener(moveModal);
}

// Helper functions
function setInputLabels(show) {
  elements.titleInput.previousElementSibling.style.display = show ? 'block' : 'none';
  elements.descInput.previousElementSibling.style.display = show ? 'block' : 'none';
  if (show) {
    elements.titleInput.previousElementSibling.textContent = 'Title';
    elements.descInput.previousElementSibling.textContent = 'Description';
  }
}

function setInputStyles() {
  elements.titleInput.style.backgroundColor = 'white';
  elements.titleInput.style.color = 'black';
  elements.descInput.style.backgroundColor = '';
  elements.descInput.style.color = '';
}

function resetInputs() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.selectStatus.value = 'todo';
}

function resetButtons() {
  const buttonContainer = elements.newTaskModalWindow.querySelector('form > div:last-child');
  buttonContainer.innerHTML = '';
  buttonContainer.appendChild(elements.createTaskBtn);
  buttonContainer.appendChild(elements.cancelAddTaskBtn);
  elements.createTaskBtn.textContent = 'Create Task';
  elements.createTaskBtn.onclick = null;
  elements.cancelAddTaskBtn.textContent = 'Cancel';
}

function createTaskObject() {
  return {
    title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.selectStatus.value,
    board: activeBoard
  };
}

function closeModalAndRefresh(form) {
  toggleModal(false, elements.newTaskModalWindow);
  elements.filterDiv.style.display = 'none';
  if (form) form.reset();
  refreshTasksUI();
}

function setButtonStyles(createText, createColor, cancelText) {
  elements.createTaskBtn.textContent = createText;
  elements.createTaskBtn.style.backgroundColor = createColor;
  elements.cancelAddTaskBtn.textContent = cancelText;
}

function applySidebarStyles() {
  elements.sideBar.style.flexDirection = 'column';
  elements.sideBar.style.height = '100vh';
  elements.boardsNavLinks.style.flexGrow = '1';
  elements.boardsNavLinks.style.overflowY = 'auto';
  const sideBarBottom = elements.sideBar.querySelector('.side-bar-bottom');
  if (sideBarBottom) sideBarBottom.style.marginTop = 'auto';
}

function updateThemeElements(isLightTheme) {
  elements.switch.checked = isLightTheme;
  elements.iconDark.style.opacity = isLightTheme ? '0.5' : '1';
  elements.iconLight.style.opacity = isLightTheme ? '1' : '0.5';
}

function updateLogo(isLightTheme) {
  const logo = document.getElementById('logo');
  if (logo) {
    logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
  }
}

function setTaskDetails(task) {
  elements.titleInput.value = task.title;
  elements.descInput.value = task.description || '';
  elements.selectStatus.value = task.status;
}

function adjustEditModeStyles() {
  setInputLabels(false);
  elements.selectStatus.previousElementSibling.style.display = 'block';
  elements.titleInput.style.marginBottom = '20px';
  elements.descInput.style.marginTop = '20px';
  elements.descInput.style.backgroundColor = 'white';
  elements.descInput.style.color = 'black';
  elements.titleInput.style.backgroundColor = '';
  elements.titleInput.style.color = '';
}

function setupEditButtons(task) {
  const buttonContainer = elements.newTaskModalWindow.querySelector('.edit-task-div.button-group') || 
                          document.createElement('div');
  buttonContainer.className = 'edit-task-div button-group';
  buttonContainer.innerHTML = '';

  const buttons = [
    { text: 'Save Changes', id: 'save-task-changes-btn', onClick: (e) => { e.preventDefault(); saveTaskChanges(task.id); } },
    { text: 'Cancel', id: 'cancel-edit-btn', onClick: (e) => { e.preventDefault(); toggleModal(false, elements.newTaskModalWindow); } },
    { text: 'Delete Task', id: 'delete-task-btn', onClick: (e) => { 
      e.preventDefault();
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(task.id);
        toggleModal(false, elements.newTaskModalWindow);
        refreshTasksUI();
      }
    }}
  ];

  buttons.forEach(btn => {
    const button = btn === buttons[0] ? elements.createTaskBtn : 
                   (btn === buttons[1] ? elements.cancelAddTaskBtn : 
                   document.createElement('button'));
    button.textContent = btn.text;
    button.id = btn.id;
    button.className = 'submit-btn';
    button.onclick = btn.onClick;
    
    // Ensure the cancel button stays yellow in edit mode
    if (btn === buttons[1]) {
      button.style.backgroundColor = '#FFA500'; // or whatever yellow color you prefer
    }
    
    buttonContainer.appendChild(button);
  });

  if (!elements.newTaskModalWindow.contains(buttonContainer)) {
    elements.newTaskModalWindow.appendChild(buttonContainer);
  }
}

function hideModalTitle() {
  const modalTitle = elements.newTaskModalWindow.querySelector('.modal-title');
  if (modalTitle) modalTitle.style.display = 'none';
  elements.newTaskModalWindow.style.width = '700px';
}

function createContextMenu(task) {
  const contextMenu = document.createElement('div');
  contextMenu.classList.add('context-menu');
  
  const options = [
    { text: 'Edit', onClick: () => openEditTaskModal(task) },
    { text: 'Delete', onClick: () => {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(task.id);
        refreshTasksUI();
      }
    }},
    { text: 'Move to...', onClick: () => showMoveOptions(task) }
  ];

  options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.textContent = option.text;
    optionElement.onclick = option.onClick;
    contextMenu.appendChild(optionElement);
  });

  return contextMenu;
}

function positionContextMenu(contextMenu, event) {
  document.body.appendChild(contextMenu);
  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.left = `${event.clientX}px`;
}

function createMoveModal(task) {
  const moveModal = document.createElement('div');
  moveModal.classList.add('move-modal');

  ['todo', 'doing', 'done'].forEach(status => {
    if (status !== task.status) {
      const option = document.createElement('button');
      option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      option.onclick = () => {
        patchTask(task.id, { status: status });
        moveModal.remove();
        refreshTasksUI();
      };
      moveModal.appendChild(option);
    }
  });

  return moveModal;
}

function addClickOutsideListener(element) {
  document.addEventListener('click', function removeElement(e) {
    if (!element.contains(e.target)) {
      element.remove();
      document.removeEventListener('click', removeElement);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  setupEventListeners();
  init();
});

function init() {
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  elements.body.classList.toggle('light-theme', isLightTheme);
  elements.switch.checked = isLightTheme;
  elements.iconDark.style.opacity = isLightTheme ? '0.5' : '1';
  elements.iconLight.style.opacity = isLightTheme ? '1' : '0.5';
  
  // Set the correct logo on init
  const logo = document.getElementById('logo');
  if (logo) {
    logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
  }
  
  fetchAndDisplayBoardsAndTasks();
}