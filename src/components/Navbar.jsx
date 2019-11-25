import React, { useCallback, useEffect } from 'react'
import TaskForm from './TaskForm'
import { debounce } from 'lodash'

const INPUT_DEBOUNCE = 500

export default ({
  downloadDb,
  downloadCSV,
  updateTaskFilter,
  taskFilter,
  isCompact,
  form,
  dbs,
  relationsToggle,
  showRelations,
  allRelations,
  allRelationsToggle,
  compactToggle,
  menuToggle,
  menuClose,
  isMenuOpen
}) => {
  const updateFilterDebounced = debounce((v) => updateTaskFilter(v), INPUT_DEBOUNCE)
  const escFunction = useCallback(({ keyCode }) => keyCode === 27 ? menuClose() : null, [])

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false)

    return () => {
      document.removeEventListener('keydown', escFunction, false)
    }
  }, [])

  return (
    <nav className='navbar'>
      <div className='navbar-start'>
        <h1>[PI PL]anning Helper</h1>
      </div>
      <div className='navbar-end'>

        <div className='navbar-item'>
          <input
            type='text'
            className='input'
            placeholder='Task Id / Story Id / Task Summary / Version / Regexp(start with "/")'
            defaultValue={taskFilter}
            onChange={(e) => {
              e.persist()
              updateFilterDebounced(e.target.value)
            }}
          />
        </div>

        {dbs ? <div className='navbar-item'>
          <div className='select'>
            <select onChange={(e) => {
              const el = document.getElementById(e.target.value)
              if (el) {
                window.scrollTo(0, el.offsetTop - 100)
              }
            }} >
              {dbs.sprints.map(({ teamName }) => <option value={teamName}>{teamName}</option>)}
            </select>
          </div>
        </div> : ''}

        <div class='navbar-item has-dropdown is-hoverable'>
          <a class='navbar-link' href='#'>
            Download
          </a>
          <div class='navbar-dropdown is-boxed'>
            <a class='navbar-item' href='#' onClick={downloadDb}>
              JSON - full database
            </a>
            <a class='navbar-item' href='#' onClick={downloadCSV}>
              CSV - tasks and positions
            </a>
          </div>
        </div>

        <div class='navbar-item has-dropdown is-hoverable'>
          <a class='navbar-link' href='#'>
            Upload
          </a>
          <div class='navbar-dropdown'>
            <form
              action='/upload'
              style={{ display: 'inherit' }}
              method='post'
              encType='multipart/form-data'>

              <div className='navbar-item'>
                <div>
                  <div className='file'>
                    <label className='file-label'>
                      <input className='file-input' type='file'name='dbFile' />
                      <span className='file-cta'>
                        <span className='file-label'>
                      Choose a file…
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className='navbar-item'>
                <input className='button' type='submit' value='Upload' />
              </div>
            </form>
          </div>
        </div>

        <div className='navbar-item'>
          <div className={`button navbar-link is-arrowless ${isCompact ? 'is-success' : ''}`} onClick={compactToggle}>
              Compact
          </div>
        </div>

        <div className='navbar-item'>
          <div className={`button navbar-link is-arrowless ${showRelations ? 'is-success' : ''}`} onClick={relationsToggle}>
              Relations
          </div>
        </div>

        <div className='navbar-item'>
          <div className={`button navbar-link is-arrowless ${allRelations ? 'is-success' : ''}`} onClick={allRelationsToggle}>
              All Relations
          </div>
        </div>

        <div className={`navbar-item has-dropdown ${isMenuOpen ? 'is-active' : ''}`}>

          <div className='navbar-link' onClick={menuToggle}>
              Create/Edit
          </div>

          <div className='navbar-dropdown is-right'>
            {isMenuOpen ? <TaskForm
              key={(form.id || 'empty') + '-form'}
              form={form}
              closeMenu={menuClose}
              teamNames={dbs ? dbs.sprints.map(sprint => ({ value: sprint.teamName, label: sprint.teamName })) : []}
              stories={dbs ? dbs.stories.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary.substr(0, 15)}`, fullLabel: `#${id}: ${summary}` })) : []}
              tasks={dbs ? dbs.tasks.map(({ id, summary }) => ({ value: id, label: `#${id}: ${summary.substr(0, 15)}` })) : []}
            /> : ''}
          </div>
        </div>
      </div>
    </nav>
  )
}
