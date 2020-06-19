import React from "react";
import "./styles.css";
import styled, { css } from "styled-components";

const Input = styled.input``;

const Button = styled.button``;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  ${({ done }) =>
    done &&
    css`
      text-decoration: line-through;
    `}
`;

export default function App() {
  const [text, setText] = React.useState("");
  const [todos, setTodos] = React.useState([]);
  const addTodo = () => {
    setTodos(todos => todos.concat({ text, done: false }));
    setText("");
  };
  const toggleTodo = index => {
    setTodos(todos =>
      todos.map((t, i) => {
        if (index === i) {
          return {
            ...t,
            done: !t.done
          };
        }
        return t;
      })
    );
  };
  return (
    <div>
      <Input
        data-testid="todo-input"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <Button data-testid="add-todo" onClick={addTodo}>
        Add
      </Button>
      <List data-testid="list">
        {todos.map(({ text, done }, i) => (
          <Item
            data-testid={`item-${i}`}
            done={done}
            onClick={() => toggleTodo(i)}
          >
            {text}
          </Item>
        ))}
      </List>
    </div>
  );
}
