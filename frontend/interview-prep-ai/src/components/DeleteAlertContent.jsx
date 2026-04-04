import React from 'react'

const DeleteAlertContent = ({content,onDelete}) => {
  return (
    <div className='p-5'>
        <p className='text-[14px]'>{content}</p>

        <div
            type="button"
            className='btn-small'
            onClick={onDelete}
        >Delete</div>
    </div>
  )
}

export default DeleteAlertContent