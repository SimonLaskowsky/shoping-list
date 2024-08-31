let toDoInput;
let ulList;
let newToDo;

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
  //create list element with flex class
  newToDo = document.createElement("li");
  newToDo.classList.add("flex");

  //create and add checbox to the list element
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("delete-checkbox", "mr-2");
  newToDo.appendChild(checkbox);

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

  const checkbox = li.querySelector(".delete-checkbox");
  li.innerHTML = "";
  li.appendChild(checkbox);
  li.appendChild(input);
  input.focus();

  input.addEventListener("blur", () => {
    const span = document.createElement("span");
    span.textContent = input.value || " ";
    li.innerHTML = "";
    li.appendChild(checkbox);
    li.appendChild(span);

    const todoId = li.dataset.id;

    if (todoId) {
      updateTodo(todoId, input.value || " ", checkbox.checked);
    }
  });

  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const span = document.createElement("span");
      span.textContent = input.value || " ";
      li.innerHTML = "";
      li.appendChild(checkbox);
      li.appendChild(span);

      const todoId = li.dataset.id;

      if (todoId) {
        updateTodo(todoId, input.value || " ", checkbox.checked); // Wywołanie updateTodo
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
