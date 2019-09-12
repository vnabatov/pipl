const initialData = {
  tasks: {
    'CPP0-1': { id: 'CPP0-1', content: 'test1' },
    'CPP0-2': { id: 'CPP0-2', content: 'test2' },
    'CPP0-3': { id: 'CPP0-3', content: 'test3' },
    'CPP0-4': { id: 'CPP0-4', content: 'test4' },
    'CPP0-5': { id: 'CPP0-5', content: 'test5' }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Sprint 1',
      taskIds: ['CPP0-1', 'CPP0-2', 'CPP0-3', 'CPP0-4', 'CPP0-5']
    },
    'column-2': {
      id: 'column-2',
      title: 'Sprint 2',
      taskIds: []
    },
    'column-3': {
      id: 'column-3',
      title: 'Sprint 3',
      taskIds: []
    },
    'column-4': {
      id: 'column-4',
      title: 'Sprint 4',
      taskIds: []
    },
    'column-5': {
      id: 'column-5',
      title: 'Sprint 5',
      taskIds: []
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4', 'column-5']
}
export default initialData