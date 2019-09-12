import React from 'react'
export default ({ changeData }) => <div>
    <input type='range' onChange={changeData} />

    <h1>Sprint Table</h1>
    <div className="sprint-table">
        <div className="sprint-table__sprint">1</div>
        <div className="sprint-table__sprint">2</div>
        <div className="sprint-table__sprint">3</div>
        <div className="sprint-table__sprint">4</div>
        <div className="sprint-table__sprint">5</div>
        <div className="sprint-table__sprint">6</div>
    </div>
</div>
