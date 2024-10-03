// TASK: import helper functions from utils
import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js'
// TASK: import initialData
import { initialData } from './initialData.js'

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
// Sidebar 
    sideBarDiv: document.getElementById("side-bar-div"),
    sideLogoDiv: document.getElementById("side-logo-div"),
    boardsNavListDiv: document.getElementById("boards-nav-links-div"),
    hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
    showSideBarBtn: document.getElementById("show-side-bar-btn"),

// Theme
    themeSwitch: document.getElementById("switch"),
    iconDark: document.getElementById("icon-dark"),
    iconLight: document.getElementById("icon-light"),

// Header
    header: document.getElementById("header"),
    headerBoardName: document.getElementById("header-board-name"),
    addNewTaskBtn: document.getElementById("add-new-task-btn"),
    editBoardBtn: document.getElementById("edit-board-btn"),
    dropdownBtn: document.getElementById("dropdownBtn"),
    dropDownIcon: document.getElementById("dropDownIcon"),

// Buttons (editing board)
    deleBoardBtn: document.getElementById("deleteBoardBtn"),
    editBoardDiv: document.getElementById("editBoardDiv"),

// Main layout
    columnDivs: document.querySelectorAll(".column-div"),
    tasksContainers: document.querySelectorAll(".tasks-container"),

// Modal (new task)
    newTaskModalWindow: document.getElementById("new-task-modal-window"),
    titleInput: document.getElementById("title-input"),
    descInput: document.getElementById("desc-input"),
    selectStatus: document.getElementById("select-status"),
    createNewTaskBtn: document.getElementById("create-task-btn"),
    cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

// Modal (edit task)
    editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
    editTaskForm: document.getElementById("edit-task-form"),
    editTaskTitleInput: document.getElementById("edit-task-title-input"),
    editTaskDescInput: document.getElementById("edit-task-desc-input"),
    editSelectStatus: document.getElementById("edit-select-status"),
    saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
    cancelEditBtn: document.getElementById("cancel-edit-btn"),
    deleteTaskBtn: document.getElementById("delete-task-btn"),

// Filter div
    filterDiv: document.getElementById("filterDiv"),
}

let activeBoard = ""

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
} 

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { 
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
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);
console.log(tasks)
  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
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

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
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
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
taskElement.addEventListener("click", () => {
  openEditTaskModal(task)
})

  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  // elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
 //elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.editTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });

  const sidebar = document.querySelector('.side-bar')
  const showSideBarBtn = document.querySelector('#show-side-bar-btn')
  
  showSideBarBtn.addEventListener('click', () => {
    sidebar.classList.add('show-sidebar')
  })

  const hideSideBarBtn = document.querySelector('#hide-side-bar-btn')

  hideSideBarBtn.addEventListener('click', () => {
    sidebar.classList.remove('show-sidebar')
  })

  elements.sideBarDiv.addEventListener("click", () => {
    toggleSidebar(true)
  })
}

// Toggles tasks modal
function toggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
      board: activeBoard
    };
  
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  if(show) {
    elements.sideBarDiv.classList.remove('hidden')
    elements.sideLogoDiv.classList.remove('hidden')
    elements.boardsNavListDiv.classList.remove('hidden')
    elements.hideSideBarBtn.style.display = 'block'
    elements.showSideBarBtn.style.display = 'block'

  } else {
    elements.sideBarDiv.classList.add('hidden')
    elements.sideLogoDiv.classList.add('hidden')
    elements.boardsNavListDiv.classList.add('hidden')
    elements.hideSideBarBtn.style.display = 'none'
    elements.showSideBarBtn.style.display = 'block'
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////NOT WORKING////////////////////////////////////////////////////////////////////////////////////////////////////////////
function toggleTheme() {
  const lightTheme = document.body.classList.toggle("light-theme")

  if(lightTheme){
    localStorage.setItem('theme', 'light')
    elements.iconDark.style.display = 'none'
    elements.iconLight.style.display = 'inline'
  } else {
    localStorage.setItem('theme', 'dark')
    elements.iconDark.style.display = 'inline'
    elements.iconLight.style.display = 'none'
  }
 
}

function applyTheme(theme) {
  if(theme === 'light') {
    document.body.classList.add('light-theme')
    elements.iconDark.style.display = 'none'
    elements.iconLight.style.display = 'inline'
  } else {
    document.body.classList.remove('light-theme')
    elements.iconDark.style.display = 'inline'
    elements.iconLight.style.display = 'none'
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme =  localStorage.getItem('theme')
  applyTheme(savedTheme)
})

elements.themeSwitch.addEventListener("click", toggleTheme)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title
  elements.editTaskDescInput.value = task.description
  elements.editSelectStatus.value = task.status

  // Get button elements from the task modal
  const saveChangesBtn = elements.saveTaskChangesBtn
  const deleteBtn = elements.deleteTaskBtn

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = () => saveTaskChanges(task.id)

  // Delete task using a helper function and close the task modal
  deleteBtn.onclick = () => {
    deleteTask(task.id)
    toggleModal(false, elements.editTaskModalWindow)
    refreshTasksUI()
  }

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value
  const updatedDescription = elements.editTaskDescInput.value
  const updatedStatus = elements.editSelectStatus

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: activeBoard
  }

  // Update task using a hlper functoin
  putTask(taskId, updatedTask)

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow)
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData()
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}