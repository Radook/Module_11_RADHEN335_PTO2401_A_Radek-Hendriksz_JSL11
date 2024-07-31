import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from "./initialData.js";

// Initialize data in localStorage
function initializeData() {
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(initialData));
        localStorage.setItem('showSideBar', 'true');
        console.log('Initial data loaded into localStorage');
    } else {
        console.log('Data already exists in localStorage');
    }
}

// Get DOM elements
const elements = {
    createNewTaskBtn: document.getElementById('create-task-btn'),
    filterDiv: document.getElementById('filterDiv'),
    sideBarDiv: document.getElementById('side-bar-div'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    header: document.getElementById('header'),
    addNewTaskBtn: document.getElementById('add-new-task-btn'),
    editBoardBtn: document.getElementById('edit-board-btn'),
    editBoardDiv: document.getElementById('editBoardDiv'),
    deleteBoardBtn: document.getElementById('deleteBoardBtn'),
    newTaskModalWindow: document.getElementById('new-task-modal-window'),
    cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
    editTaskForm: document.getElementById('edit-task-form'),
    saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn'),
    todoHeadDiv: document.getElementById('todo-head-div'),
    doingHeadDiv: document.getElementById('doing-head-div'),
    doneHeadDiv: document.getElementById('done-head-div'),
    headerBoardName: document.getElementById('header-board-name'),
    dropDownIcon: document.getElementById('dropDownIcon'),
    threeDotsIcon: document.getElementById('three-dots-icon'),
    todoDot: document.getElementById('todo-dot'),
    doingDot: document.getElementById('doing-dot'),
    doneDot: document.getElementById('done-dot'),
    modalTitleInput: document.getElementById('title-input'),
    modalDescInput: document.getElementById('desc-input'),
    selectStatus: document.getElementById('select-status'),
    editSelectStatus: document.getElementById('edit-select-status'),
    editTaskTitleInput: document.getElementById('edit-task-title-input'),
    editTaskDescInput: document.getElementById('edit-task-desc-input'),
    columnDivs: document.querySelectorAll('.column-div')
};

let activeBoard = 'Launch Career'; // Default board name

// Function to filter and display tasks based on the board name
function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.board === boardName);

    elements.columnDivs.forEach(column => {
        const status = column.getAttribute("data-status");

        column.innerHTML = `
            <div class="column-head-div">
                <span class="dot" id="${status}-dot"></span>
                <h4 class="columnHeader">${status.toUpperCase()}</h4>
            </div>
        `;

        const tasksContainer = document.createElement("div");
        tasksContainer.className = 'tasks-container';
        column.appendChild(tasksContainer);

        filteredTasks.filter(task => task.status === status).forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task-div");
            taskElement.textContent = task.title;
            taskElement.setAttribute('data-task-id', task.id);

            taskElement.addEventListener("click", () => {
                openEditTaskModal(task);
            });

            tasksContainer.appendChild(taskElement);
        });
    });
}

function refreshTasksUI() {
    filterAndDisplayTasksByBoard(activeBoard);
}

function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach(btn => {
        if (btn.textContent === boardName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    console.log(`Styled board "${boardName}" as active`);
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
    console.log(`Added task "${task.title}" to UI`);
}

function setupEventListeners() {
    elements.cancelEditBtn.addEventListener('click', () => {
        toggleModal(false, elements.editTaskModalWindow);
    });

    elements.cancelAddTaskBtn.addEventListener('click', () => {
        toggleModal(false, elements.newTaskModalWindow);
        elements.filterDiv.style.display = 'none';
    });

    elements.filterDiv.addEventListener('click', () => {
        toggleModal(false, elements.newTaskModalWindow);
        elements.filterDiv.style.display = 'none';
    });

    elements.hideSideBarBtn.addEventListener('click', () => {
        toggleSidebar(false);
    });

    elements.showSideBarBtn.addEventListener('click', () => {
        toggleSidebar(true);
    });

    elements.createNewTaskBtn.addEventListener('click', () => {
        toggleModal(true, elements.newTaskModalWindow);
        elements.filterDiv.style.display = 'block';
    });

    elements.newTaskModalWindow.addEventListener('submit', (event) => {
        event.preventDefault();
        addTask(event);
    });

    elements.saveTaskChangesBtn.addEventListener('click', () => {
        const taskId = parseInt(elements.editTaskTitleInput.getAttribute('data-task-id'), 10);
        saveTaskChanges(taskId);
    });

    elements.deleteTaskBtn.addEventListener('click', () => {
        const taskId = parseInt(elements.editTaskTitleInput.getAttribute('data-task-id'), 10);
        deleteTask(taskId);
        toggleModal(false, elements.editTaskModalWindow);
        refreshTasksUI();
    });

    console.log('Event listeners set up successfully.');
}

function toggleModal(show, modal = elements.newTaskModalWindow) {
    modal.style.display = show ? 'block' : 'none';
    console.log(`Modal ${show ? 'opened' : 'closed'}`);
}

function addTask(event) {
    event.preventDefault();

    const task = {
        id: Date.now(),
        title: elements.modalTitleInput.value,
        description: elements.modalDescInput.value,
        status: elements.selectStatus.value,
        board: activeBoard
    };
    const newTask = createNewTask(task);
    if (newTask) {
        addTaskToUI(newTask);
        toggleModal(false, elements.newTaskModalWindow);
        elements.filterDiv.style.display = 'none';
        event.target.reset();
        refreshTasksUI();
    }
}

function toggleSidebar(show) {
    elements.sideBarDiv.style.display = show ? 'block' : 'none';
    console.log(`Sidebar ${show ? 'shown' : 'hidden'}`);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar);
});

function openEditTaskModal(task) {
    elements.editTaskTitleInput.value = task.title;
    elements.editTaskDescInput.value = task.description;
    elements.editTaskTitleInput.setAttribute('data-task-id', task.id);
    elements.editSelectStatus.value = task.status;
    toggleModal(true, elements.editTaskModalWindow);
    console.log(`Opened edit task modal for task ID: ${task.id}`);
}

function saveTaskChanges(taskId) {
    const updatedTask = {
        id: taskId,
        title: elements.editTaskTitleInput.value,
        description: elements.editTaskDescInput.value,
        status: elements.editSelectStatus.value,
        board: activeBoard
    };
    patchTask(taskId, updatedTask);
    toggleModal(false, elements.editTaskModalWindow);
    refreshTasksUI();
    console.log(`Saved changes for task ID: ${taskId}`);
}

// Initialize data and setup event listeners
initializeData();
setupEventListeners();
filterAndDisplayTasksByBoard(activeBoard);
styleActiveBoard(activeBoard);
