import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd'
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons'
import React, { useCallback, useEffect, useState } from 'react'

import Column from './Column'
import { Data } from '../../ts/interfaces'
import Input from './Input'
import Tooltip from '../utils/Tooltip'
import _ from 'lodash'
import { trpc } from '../../utils/trpc'

const Board = ({ data, title }: { data: any; title: string }) => {
  const [state, setState] = useState<Data>(data)
  const trpcClient = trpc.useContext()
  const [isLoading, setisLoading] = useState(true)
  const { mutate, error } = trpc.useMutation(['board.change'], {
    onSuccess: () => {
      // trpcClient.invalidateQueries(['users.board']) //board name edit
    },
  })

  useEffect(() => {
    setTimeout(() => {
      setisLoading(false)
    }, 200)
  }, [])

  useEffect(() => {
    mutate({ boardTitle: title, state: state })
  }, [mutate, title, state])

  const onDragEnd = (res: DropResult) => {
    const { destination, source, draggableId, type } = res

    if (!destination) {
      return
    }

    //dropped task in the origin location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    //move columns order
    if (type === 'column') {
      const newColumnOrder = [...state.columnOrder]
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      setState((prev) => ({
        ...prev,
        columnOrder: newColumnOrder,
      }))
      return
    }

    //move tasks inside columns
    const startcol = state.columns[source.droppableId]
    const endcol = state.columns[destination.droppableId]

    if (startcol === endcol) {
      const tasks = [...startcol.taskIds]
      tasks.splice(source.index, 1)
      tasks.splice(destination.index, 0, draggableId)

      const newCol = {
        ...startcol,
        taskIds: tasks,
      }

      setState((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newCol.id]: newCol,
        },
      }))
      return
    }

    //move tasks between columns
    const startTaskIds = [...startcol.taskIds]
    startTaskIds.splice(source.index, 1)

    const newStart = {
      ...startcol,
      taskIds: startTaskIds,
    }

    const endTaskIds = [...endcol.taskIds]
    endTaskIds.splice(destination.index, 0, draggableId)

    const newEnd = {
      ...endcol,
      taskIds: endTaskIds,
    }

    setState((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newEnd.id]: newEnd,
      },
    }))
  }

  const addColumn = () => {
    setState((prev) => {
      const newColumn =
        prev.columnOrder.length > 0
          ? prev.columnOrder.slice(-1)[0].slice(0, -1) +
            (Number(prev.columnOrder.slice(-1)[0].slice(-1)[0]) + 1)
          : 'column-1'
      const filterEmptyColumns = _.filter(
        prev.columns,
        (column) => column.title === ''
      )

      if (filterEmptyColumns.length > 0)
        return {
          ...prev,
        }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn]: {
            id: newColumn,
            title: '',
            taskIds: [],
          },
        },

        columnOrder: [...prev.columnOrder, newColumn],
      }
    })
  }

  const deleteColumn = () => {
    setState((prev) => {
      const column = prev.columnOrder.slice(-1)[0]

      const filterEmptyColumns = _.filter(
        prev.columns,
        (column) => column.title === ''
      )

      if (filterEmptyColumns.length > 1) {
        return {
          ...prev,
        }
      }
      //get tasks that are inside last column
      const tasksInLastColumn = _.valuesIn(prev.columns[column].taskIds)

      //delete selected tasks (from last column) from the tasks object (state.tasks)
      const newTasks = _.omitBy(prev.tasks, (task) =>
        tasksInLastColumn.includes(task.id)
      )

      //delete column from Column Object, (the last column in columnOrder)
      const newColumns = _.pick(prev.columns, [
        ...prev.columnOrder.slice(0, -1),
      ])

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: [...prev.columnOrder.slice(0, -1)],
      }
    })
  }

  // const handleComboKey = useCallback((e: { key: any }) => {
  //   if (e.key == 'Meta') {
  //     setShow((prev) => !prev)
  //   }
  // }, [])

  // useEffect(() => {
  //   // attach the event listener for Meta key
  //   document.addEventListener('keydown', handleComboKey)

  //   // remove the event listener
  //   return () => {
  //     document.removeEventListener('keydown', handleComboKey)
  //   }
  // }, [handleComboKey])

  return (
    <div
      className={`flex flex-col mx-2 transition-opacity duration-500 ${
        !isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* <div className='dark:bg-black-velvet h-96 mt-2 rounded-xl'></div> */}
      <Input state={state} setState={setState} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='columns' direction='horizontal' type='column'>
          {({ droppableProps, innerRef, placeholder }) => (
            <div
              {...droppableProps}
              ref={innerRef}
              className=' h-full w-full flex justify-center'
            >
              {state.columnOrder.map((id, i) => {
                const col = state.columns[id]
                const tasks = col.taskIds.map((taskid) => state.tasks[taskid])
                return (
                  <Column
                    key={id}
                    column={col}
                    tasks={tasks}
                    index={i}
                    setState={setState}
                  />
                )
              })}
              {placeholder}

              <div className='flex flex-col my-2'>
                {state.columnOrder.length < 5 && (
                  <Tooltip tip='Add Columns'>
                    <button
                      onClick={addColumn}
                      className='border-2 bg-white dark:bg-black-velvet dark:border-transparent p-1 mb-2 rounded-md hover:border-green-500 transition-colors duration-200'
                    >
                      <PlusIcon className='h-5 w-5' />
                    </button>
                  </Tooltip>
                )}
                {state.columnOrder.length > 0 && (
                  <Tooltip tip='Delete Columns'>
                    <button
                      onClick={deleteColumn}
                      className='border-2 bg-white dark:bg-black-velvet dark:border-transparent p-1 mb-2 rounded-md hover:border-rose-500 transition-colors duration-200'
                    >
                      <MinusIcon className='h-5 w-5' />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default Board
