import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)

  const getDateString = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const isToday = (date) => {
    return getDateString(date) === getDateString(new Date())
  }

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_date', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
    setLoading(false)
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (inputValue.trim() === '') return

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: inputValue }])
      .select()

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setTodos([data[0], ...todos])
      setInputValue('')
    }
  }

  const toggleTodo = async (id, completed) => {
    const updates = {
      completed: !completed,
      completed_date: !completed ? new Date().toISOString() : null
    }

    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      ))
    }
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  // Separate todos into three groups
  const todayTasks = todos.filter(t => !t.completed && isToday(t.created_date))
  const todayCompleted = todos.filter(t => t.completed && t.completed_date && isToday(t.completed_date))
  const pastCompleted = todos.filter(t => t.completed && t.completed_date && !isToday(t.completed_date))

  const TodoItem = ({ todo }) => (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id, todo.completed)}
        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span
        className={`flex-1 ${
          todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </li>
  )

  const Section = ({ title, items, emptyMessage }) => (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-6">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map(todo => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Simple Todo
        </h1>

        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Add
            </button>
          </div>
        </form>

        <Section
          title="Today's Tasks"
          items={todayTasks}
          emptyMessage="No tasks for today. Add one above!"
        />

        <Section
          title="Completed Today"
          items={todayCompleted}
          emptyMessage="No completed tasks today yet."
        />

        {pastCompleted.length > 0 && (
          <Section
            title="Previously Completed"
            items={pastCompleted}
            emptyMessage=""
          />
        )}

        {todos.length > 0 && (
          <p className="text-white/80 text-center mt-4 text-sm">
            {todos.filter(t => t.completed).length} of {todos.length} tasks completed
          </p>
        )}
      </div>
    </div>
  )
}

export default App
