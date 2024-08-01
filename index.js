// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from "./initialData.js";
// DONE :)

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBar: document.getElementById('side-bar-div'),
    logo: document.getElementById('logo'),
    boardsNavLinks: document.getElementById('boards-nav-links-div'),
    headlineSidepanel: document.getElementById('headline-sidepanel'),
    toggleDiv: document.querySelector('.toggle-div'),
    iconDark: document.getElementById('icon-dark'),
    switch: document.getElementById('switch'),
    labelCheckboxTheme: document.getElementById('label-checkbox-theme'),
    iconLight: document.getElementById('icon-light'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    layout: document.getElementById('layout'),
    header: document.getElementById('header'),
    headerBoardName: document.getElementById('header-board-name'),
    dropdownBtn: document.getElementById('dropdownBtn'),
    dropDownIcon: document.getElementById('dropDownIcon'),
    addNewTaskBtn: document.getElementById('add-new-task-btn'),
    editBoardBtn: document.getElementById('edit-board-btn'),
    editBoardDiv: document.getElementById('editBoardDiv'),
    deleteBoardBtn: document.getElementById('deleteBoardBtn'),
    todoHeadDiv: document.getElementById('todo-head-div'),
    toDoText: document.getElementById('toDoText'),
    doingHeadDiv: document.getElementById('doing-head-div'),
    doingText: document.getElementById('doingText'),
    doneHeadDiv: document.getElementById('done-head-div'),
    doneText: document.getElementById('doneText'),
    newTaskModalWindow: document.getElementById('new-task-modal-window'),
    titleInput: document.getElementById('title-input'),
    descInput: document.getElementById('desc-input'),
    selectStatus: document.getElementById('select-status'),
    createTaskBtn: document.getElementById('create-task-btn'),
    cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
    editTaskForm: document.getElementById('edit-task-form'),
    editTaskTitleInput: document.getElementById('edit-task-title-input'),
    editTaskDescInput: document.getElementById('edit-task-desc-input'),
    editSelectStatus: document.getElementById('edit-select-status'),
    saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn'),
    filterDiv: document.getElementById('filterDiv'),
    columnDivs: document.querySelectorAll('.column-div'),
    editTaskModal: document.getElementById('edit-task-modal'),
    saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn')
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS

//DONE
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs

//DONE
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {  
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs

//DONE
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    const statusTasks = filteredTasks.filter(task => task.status === status);

    statusTasks.forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Add click event listener to open edit modal
      taskElement.addEventListener("click", () => {
        console.log('Task clicked:', task); // Debug log
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  const tasks = getTasks(); // Fetch the latest tasks from storage
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs

//DONE
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}


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


function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  elements.cancelAddTaskBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission
    toggleModal(false, elements.newTaskModalWindow);
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listeners
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.switch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit', (event) => {
    event.preventDefault();
    if (elements.createTaskBtn.textContent === 'Create Task') {
      addTask(event);
    }
    // The save changes functionality is now handled in the openEditTaskModal function
  });

  // Cancel adding/editing task event listener
  elements.cancelAddTaskBtn.addEventListener('click', (event) => {
    event.preventDefault();
    toggleModal(false, elements.newTaskModalWindow);
    resetNewTaskModal();
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal) {
  console.log('toggleModal called with:', show, modal); // Debug log
  if (modal) {
    modal.style.display = show ? 'block' : 'none';
    elements.filterDiv.style.display = show ? 'block' : 'none';
    console.log('Modal display set to:', modal.style.display); // Debug log
  } else {
    console.error('Modal element not provided to toggleModal function');
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Check if required fields are not empty
  if (!elements.titleInput.value.trim()) {
    alert('Please enter a task title');
    return;
  }

  // Assign user input to the task object
  const task = {
    title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.selectStatus.value,
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false, elements.newTaskModalWindow);
    elements.newTaskModalWindow.reset(); // Reset the form
    refreshTasksUI();
  } else {
    alert('Failed to create new task. Please try again.');
  }
}


function toggleSidebar(show) {
  console.log('toggleSidebar called with:', show);
  elements.sideBar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  elements.layout.classList.toggle('no-sidebar', !show);
  localStorage.setItem('showSideBar', show);
}

function toggleTheme() {
  const body = document.body;
  const isLightTheme = body.classList.toggle('light-theme');
  
  // Update switch state
  elements.switch.checked = isLightTheme;
  
  // Update icons
  elements.iconDark.style.opacity = isLightTheme ? '0.5' : '1';
  elements.iconLight.style.opacity = isLightTheme ? '1' : '0.5';
  
  // Save theme preference to localStorage
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

// Update the openEditTaskModal function
function openEditTaskModal(task) {
  console.log('openEditTaskModal called with task:', task);

  if (!elements.newTaskModalWindow) {
    console.error('New task modal window not found in the DOM');
    return;
  }

  // Populate the modal with task data
  elements.titleInput.value = task.title;
  elements.descInput.value = task.description || '';
  elements.selectStatus.value = task.status;

  // Change the submit button text and functionality
  elements.createTaskBtn.textContent = 'Save Changes';
  elements.createTaskBtn.onclick = (event) => {
    event.preventDefault();
    saveTaskChanges(task.id);
  };

  // Ensure the "Cancel" button is present and functioning
  const cancelBtn = elements.newTaskModalWindow.querySelector('#cancel-add-task-btn');
  if (cancelBtn) {
    cancelBtn.onclick = (event) => {
      event.preventDefault();
      toggleModal(false, elements.newTaskModalWindow);
      resetNewTaskModal();
    };
  } else {
    console.error('Cancel button not found');
  }

  // Show the modal
  toggleModal(true, elements.newTaskModalWindow);
}

// Add this new function to save task changes
function saveTaskChanges(taskId) {
  const updatedTask = {
    title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.selectStatus.value,
    board: activeBoard
  };

  const success = patchTask(taskId, updatedTask);

  if (success) {
    toggleModal(false, elements.newTaskModalWindow);
    refreshTasksUI();
  } else {
    alert('Failed to update task. Please try again.');
  }
}

// Update the resetNewTaskModal function to restore the original button layout
function resetNewTaskModal() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.selectStatus.value = 'todo'; // Set to default value
  
  // Reset the "Create Task" button
  elements.createTaskBtn.textContent = 'Create Task';
  elements.createTaskBtn.onclick = addTask;

  // Ensure the "Add New Task" title is present
  const modalTitle = elements.newTaskModalWindow.querySelector('h2');
  if (modalTitle) {
    modalTitle.textContent = 'Add New Task';
  }

  // Ensure the "Title" label is visible
  const titleLabel = elements.newTaskModalWindow.querySelector('label[for="title-input"]');
  if (titleLabel) {
    titleLabel.style.display = '';
  }
}

function updateEntireTask(taskId, updatedTask) {
  const success = putTask(taskId, updatedTask);
  
  if (success) {
    refreshTasksUI();
  } else {
    alert('Failed to update the entire task. Please try again.');
  }
}

// Add the showContextMenu function
function showContextMenu(event, task) {
  event.preventDefault();
  const contextMenu = document.createElement('div');
  contextMenu.classList.add('context-menu');
  
  const editOption = document.createElement('div');
  editOption.textContent = 'Edit';
  editOption.onclick = () => openEditTaskModal(task);

  const deleteOption = document.createElement('div');
  deleteOption.textContent = 'Delete';
  deleteOption.onclick = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      refreshTasksUI();
    }
  };

  const moveOption = document.createElement('div');
  moveOption.textContent = 'Move to...';
  moveOption.onclick = () => showMoveOptions(task);

  contextMenu.appendChild(editOption);
  contextMenu.appendChild(deleteOption);
  contextMenu.appendChild(moveOption);

  document.body.appendChild(contextMenu);

  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.left = `${event.clientX}px`;

  document.addEventListener('click', function removeMenu() {
    contextMenu.remove();
    document.removeEventListener('click', removeMenu);
  });
}

// Add the showMoveOptions function
function showMoveOptions(task) {
  const moveModal = document.createElement('div');
  moveModal.classList.add('move-modal');

  const statusOptions = ['todo', 'doing', 'done'];
  statusOptions.forEach(status => {
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

  document.body.appendChild(moveModal);

  document.addEventListener('click', function removeModal(e) {
    if (!moveModal.contains(e.target)) {
      moveModal.remove();
      document.removeEventListener('click', removeModal);
    }
  });
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeData(); // Ensure initial data is set up
    setupEventListeners(); // Make sure this is called
    init();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

function init() {
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  elements.switch.checked = isLightTheme;
  elements.iconDark.style.opacity = isLightTheme ? '0.5' : '1';
  elements.iconLight.style.opacity = isLightTheme ? '1' : '0.5';
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}