import { useState, useEffect } from 'react';

export const App = (props) => {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    console.log('[TodoList] Component mounted');
    loadTasks();
  }, []);

  async function loadTasks() {
    console.log('[TodoList] loadTasks called');
    setLoadError(null);
    try {
      console.log('[TodoList] Calling FETCH_TODOS via i:self');
      const result = await callTool({
        integrationId: 'i:self',
        toolName: 'FETCH_TODOS',
        input: { include_completed: true }
      });
      
      console.log('[TodoList] FETCH_TODOS response:', result);
      
      // Extract result from the response
      const toolResult = result.structuredContent?.result || result.structuredContent || result.result || result;
      
      if (toolResult.error) {
        throw new Error(toolResult.error);
      }
      
      const taskList = toolResult.tasks || [];
      console.log('[TodoList] Extracted tasks:', taskList);
      console.log('[TodoList] Total tasks:', toolResult.total || 0);
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (err) {
      console.error('[TodoList] Load failed:', err);
      setLoadError(`Failed to load tasks: ${err.message || 'Unknown error'}`);
      setTasks([]);
    }
  }

  async function handleAddTask() {
    if (!taskInput.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('[TodoList] Enhancing task input:', taskInput);
      const enhanced = await callTool({
        integrationId: 'i:self',
        toolName: 'TODO_AI_ENHANCE',
        input: { raw_input: taskInput }
      });
      
      console.log('[TodoList] Enhancement response:', enhanced);
      
      const enhancedData = enhanced.structuredContent?.result || enhanced.structuredContent || enhanced.result || enhanced;
      
      if (enhancedData.error) {
        throw new Error(enhancedData.error);
      }
      
      console.log('[TodoList] Creating task with enhanced data:', enhancedData);
      const createResult = await callTool({
        integrationId: 'i:self',
        toolName: 'TODO_CREATE',
        input: {
          original_input: taskInput,
          description: enhancedData.description || taskInput,
          tags: Array.isArray(enhancedData.tags) ? enhancedData.tags : [],
          priority: enhancedData.priority || 'medium'
        }
      });
      
      console.log('[TodoList] Create response:', createResult);
      
      const createData = createResult.structuredContent?.result || createResult.structuredContent || createResult.result || {};
      if (createData.error) {
        throw new Error(createData.error);
      }
      
      console.log('[TodoList] Task created successfully');
      setTaskInput('');
      await loadTasks();
    } catch (err) {
      console.error('[TodoList] Add failed:', err);
      setError(`Failed to add task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggle(id, completed) {
    console.log('[TodoList] Toggling task:', id, 'from completed:', completed);
    try {
      const result = await callTool({
        integrationId: 'i:self',
        toolName: 'TODO_UPDATE',
        input: { id, completed: !completed }
      });
      
      console.log('[TodoList] Toggle response:', result);
      
      const toggleData = result.structuredContent?.result || result.structuredContent || result.result || {};
      if (!toggleData.error) {
        await loadTasks();
      } else {
        console.error('[TodoList] Toggle failed:', toggleData.error);
      }
    } catch (err) {
      console.error('[TodoList] Toggle failed:', err);
    }
  }

  async function handleDelete(id) {
    console.log('[TodoList] Deleting task:', id);
    try {
      const result = await callTool({
        integrationId: 'i:self',
        toolName: 'TODO_DELETE',
        input: { id }
      });
      
      console.log('[TodoList] Delete response:', result);
      
      const deleteData = result.structuredContent?.result || result.structuredContent || result.result || {};
      if (!deleteData.error) {
        await loadTasks();
      } else {
        console.error('[TodoList] Delete failed:', deleteData.error);
      }
    } catch (err) {
      console.error('[TodoList] Delete failed:', err);
    }
  }

  const priorityColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-gray-600 bg-gray-50'
  };

  return (
    <div className="max-w-4xl mx-auto p-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI-Powered To-Do List</h1>
        <p style={{ color: 'var(--muted-foreground)' }} className="mt-2">Add tasks naturally, let AI organize them</p>
      </header>

      {loadError && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', borderColor: 'var(--border)' }}>
          <strong>Load Error:</strong> {loadError}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-lg p-6 mb-8">
        <textarea
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="What needs to be done? (e.g., 'Call mom tomorrow', 'Buy groceries', 'Finish project report by Friday')"
          className="w-full p-4 border rounded-lg resize-none focus:ring-2"
          style={{ borderColor: 'var(--border)', outline: 'none' }}
          rows={3}
          disabled={isProcessing}
        />
        <div className="flex justify-between items-center mt-4">
          {error && <span style={{ color: 'var(--destructive)' }} className="text-sm">{error}</span>}
          <button
            onClick={handleAddTask}
            disabled={!taskInput.trim() || isProcessing}
            className="ml-auto px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)'
            }}
          >
            {isProcessing ? 'Processing...' : 'Add Task'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-lg">
        {tasks.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {tasks.map(task => (
              <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-opacity-50 transition">
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => handleToggle(task.id, task.completed)}
                  className="mt-1 h-5 w-5 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className={`${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.description}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {task.tags && task.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 text-xs rounded ${priorityColors[task.priority] || 'bg-gray-100'}`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Metadata exports
export const name = "todo_list_view";
export const description = "AI-Powered To-Do List - React interface for task management";