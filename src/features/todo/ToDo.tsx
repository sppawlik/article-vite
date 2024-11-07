import React, { useEffect, useState } from "react"
import type {Schema} from "../../../amplify/data/resource";
import {generateClient} from "aws-amplify/data";

const client = generateClient<Schema>();


export function ToDo() {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    useEffect(() => {
        client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });
    }, []);

    function deleteTodo(id: string) {
        client.models.Todo.delete({id})
    }

    function createTodo() {
        client.models.Todo.create({content: window.prompt("Todo content")});
    }


    return (
        <div>

            <div>
                <button onClick={createTodo}>+ new</button>
                <ul>
                    {todos.map((todo) => (
                        <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
                    ))}
                </ul>
                <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                    Review next step of this tutorial.
                </a>
            </div>
        </div>
    )
}