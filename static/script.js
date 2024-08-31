let toDoInput;
let ulList;
let newToDo;

const listItemTemplate = `
  <div class="cbx">
    <input type="checkbox" class="delete-checkbox" id="cbx" />
    <label for="cbx"></label>
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
      <path d="M2 8.36364L6.23077 12L13 2"></path>
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="goo">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="4"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  </div>
`;

const main = () => {
  prepareDOMElements();
  prepareDOMEvents();
};

const prepareDOMElements = () => {
  toDoInput = document.querySelector(".todo-input");
  ulList = document.querySelector(".todolist ul");
};

const prepareDOMEvents = () => {
  ulList.addEventListener("click", checkClick);
  toDoInput.addEventListener("keyup", enterKeyCheck);
};

const addNewTodoToDatabase = (newText) => {
  fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ item: newText }),
  }).then((response) => {
    return response.json();
  });
};

const addNewToDo = (text, id = null) => {
  //create list element
  newToDo = document.createElement("li");
  //put template to our new element
  newToDo.classList.add("flex");
  newToDo.innerHTML = listItemTemplate;

  //add id dataset to elements
  if (id) {
    newToDo.dataset.id = id;
  }

  //create span and add text from param or toDoInput.value
  const span = document.createElement("span");
  toDoInput.value
    ? (span.textContent = toDoInput.value)
    : (span.textContent = text);
  newToDo.appendChild(span);

  ulList.append(newToDo);
};

const updateTodo = (todoId, newItem, newChecked) => {
  fetch(`/todos/${todoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: todoId,
      item: newItem,
      checked: newChecked,
    }),
  }).then((response) => response.json());
};

const deleteTodo = (todoId) => {
  fetch(`/todos/${todoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: todoId }),
  }).then((response) => response.json());
};

const checkClick = (e) => {
  if (e.target.classList.contains("delete-checkbox")) {
    const todoId = e.target.closest("li").dataset.id;
    if (todoId) {
      deleteTodo(todoId);
    }
    e.target.closest("li").remove();
  } else if (e.target.tagName === "SPAN") {
    const clickedLi = e.target.closest("li");
    if (clickedLi) {
      makeEditable(clickedLi);
    }
  }
};

const makeEditable = (li) => {
  const input = document.createElement("input");
  input.type = "text";
  input.value = li.querySelector("span").textContent;
  input.classList.add(
    "todo-edit-input",
    "focus:border-none",
    "focus:outline-none",
    "w-1/2"
  );

  // Zapisz stan checkboxa
  const checkbox = li.querySelector(".delete-checkbox");
  const wasChecked = checkbox.checked;

  // Użyj szablonu
  li.innerHTML = listItemTemplate;

  li.appendChild(input);
  checkbox.checked = wasChecked;

  input.focus();

  input.addEventListener("blur", () => {
    const span = document.createElement("span");
    span.textContent = input.value || " ";

    // Użyj szablonu
    li.innerHTML = listItemTemplate;

    li.appendChild(span);
    const newCheckbox = li.querySelector(".delete-checkbox");
    newCheckbox.checked = wasChecked;

    const todoId = li.dataset.id;

    if (todoId) {
      updateTodo(todoId, input.value || " ", newCheckbox.checked);
    }
  });

  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const span = document.createElement("span");
      span.textContent = input.value || " ";

      // Użyj szablonu
      li.innerHTML = listItemTemplate;

      li.appendChild(span);
      const newCheckbox = li.querySelector(".delete-checkbox");
      newCheckbox.checked = wasChecked;

      const todoId = li.dataset.id;

      if (todoId) {
        updateTodo(todoId, input.value || " ", newCheckbox.checked);
      }
    }
  });
};

const enterKeyCheck = (e) => {
  if (e.key === "Enter" && toDoInput.value !== "") {
    addNewToDo();
    addNewTodoToDatabase(toDoInput.value);
    toDoInput.value = "";
  }
};

const fetchTodos = () => {
  fetch("/todos")
    .then((response) => response.json())
    .then((todos) => {
      todos.forEach((todo) => {
        addNewToDo(todo.item, todo.id);
      });
    });
};

document.addEventListener("DOMContentLoaded", () => {
  main();
  fetchTodos();
});
