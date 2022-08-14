import { Draggable, Droppable } from 'react-beautiful-dnd'
import { useEffect, useState } from 'react'

import Collapse from './buttons/Collapse'
import { ColumnProps } from '../ts/interfaces'
import Plus from './buttons/Plus'
import Task from './Task'
import X from './buttons/X'
import _ from 'lodash'

const Column = ({ column, tasks, index, setState }: ColumnProps) => {
  const [title, setTitle] = useState('')
  const [isFocus, setIsFocus] = useState(true)
  const [isBlur, setIsBlur] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {
    if (title === '') return
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        setState((prev) => {
          const columnIndex = prev.columnOrder.length
          const newColumn = `column-${columnIndex}`
          return {
            ...prev,
            columns: {
              ...prev.columns,
              [newColumn]: {
                id: newColumn,
                title: title,
                taskIds: [],
              },
            },
          }
        })
        setTitle('')
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  })

  const handleAddTask = (column: string, text: string) => {
    setState((prev) => {
      //check if there already is a existing new empty task

      //replace lodash with .length xddddd
      const index = _.size(prev.tasks)
      const task = `task-${index + 1}`
      const taskID = `task-${index}`
      const lastTaskObject = _.get(prev.tasks, taskID)

      if (lastTaskObject?.content === '')
        return {
          ...prev,
        }

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [task]: { id: task, content: text },
        },
        columns: {
          ...prev.columns,
          [column]: {
            id: column,
            title: prev.columns[column].title,
            taskIds: [...prev.columns[column].taskIds, task],
          },
        },
      }
    })
  }

  const handleDeleteTask = (column: string) => {
    setState((prev) => {
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [column]: {
            id: column,
            title: prev.columns[column].title,
            taskIds: [...prev.columns[column].taskIds.slice(0, -1)],
          },
        },
      }
    })
  }

  const handleCollapseColumn = () => {
    setIsCollapsed((prev) => !prev)
  }

  const titleHandler = (input: string) => setTitle(input)
  const blurHandler = () => {
    setIsFocus(false)
    setIsBlur(true)
  }
  const focusHandler = () => {
    setIsFocus(true)
    setIsBlur(false)
  }
  return (
    <Draggable draggableId={column.id} index={index}>
      {({ draggableProps, dragHandleProps, innerRef }, { isDragging }) => (
        <div
          {...draggableProps}
          ref={innerRef}
          className={`w-full border-2 bg-white dark:bg-black border-black rounded-md my-2 mr-2 flex flex-col max-w-xs h-fit ${
            isDragging ? 'border-blue-600' : 'border-inherit'
          }`}
        >
          <div className='pt-2 mx-2 box-border' {...dragHandleProps}>
            {column.title === '' ? (
              <input
                autoFocus
                type='text'
                className={`dark:bg-black text-2xl font-bold max-w-full text-center outline-none ${
                  isFocus
                    ? 'border-2 rounded-md border-orange-500'
                    : isBlur
                    ? 'border-2 rounded-md border-rose-500'
                    : ''
                }`}
                value={title}
                onChange={(e) => titleHandler(e.target.value)}
                onFocus={focusHandler}
                onBlur={blurHandler}
                placeholder='Type column name...'
              />
            ) : (
              <h1 className='text-2xl font-bold flex justify-center border-2 border-white dark:border-black'>
                {column.title}
              </h1>
            )}
          </div>
          <Droppable droppableId={column.id} type='task'>
            {({ droppableProps, innerRef, placeholder }) => (
              <div className='container flex flex-col justify-end h-fit'>
                <div
                  ref={innerRef}
                  {...droppableProps}
                  className={`flex flex-col flex-grow px-2 pb-2 ${
                    isCollapsed ? 'min-h-400' : 'hidden'
                  }`}
                >
                  {isCollapsed && (
                    <>
                      {tasks.map((task, i) => (
                        <Task
                          key={task.id}
                          task={task}
                          index={i}
                          setState={setState}
                          column={column.id}
                        />
                      ))}
                    </>
                  )}
                  {placeholder}
                </div>

                <div className='flex flex-row mb-2 pl-2 mt-2'>
                  <button
                    className='border-2 w-8 h-8 rounded-md flex flex-col justify-center hover:border-green-500 transition-colors duration-200'
                    onClick={() => handleAddTask(column.id, '')}
                  >
                    <Plus />
                  </button>
                  <button
                    className='border-2 w-8 h-8 rounded-md ml-2 flex flex-col justify-center hover:border-rose-500 transition-colors duration-200'
                    onClick={() => handleDeleteTask(column.id)}
                  >
                    <X />
                  </button>
                  <button
                    className={`border-2 w-8 h-8 rounded-md ml-2 flex flex-col justify-center hover:border-orange-500 transition-colors duration-200 ${
                      !isCollapsed && 'rotate-180'
                    }`}
                    onClick={handleCollapseColumn}
                  >
                    <Collapse />
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}

export default Column
