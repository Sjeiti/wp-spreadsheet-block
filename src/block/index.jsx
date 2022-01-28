import React, { useState, useEffect } from 'react'
import { registerBlockType } from '@wordpress/blocks'
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck
} from '@wordpress/block-editor'
import { PanelBody, Button } from '@wordpress/components'
import { Fragment } from '@wordpress/element'
import { __ } from '@wordpress/i18n'

import {getCellId,init,spreadsheetEvent} from '../js/index'
import {toggleEntry} from '../js/utils'

// const __ = ss=>ss
const ssb = 'ssb'
// const ALLOWED_MEDIA_TYPES = [ '.xlsx', '.xls', '.csv' ]
// const ALLOWED_MEDIA_TYPES = [ 'xlsx', 'xls', 'csv' ]
// const ALLOWED_MEDIA_TYPES = [ 'documents' ]
const ALLOWED_MEDIA_TYPES = []

const blockStyle = {
  backgroundColor: 'white',
  padding: '20px',
  boxShadow: '0 0 0 1px solid inset'
}

function view(attr, admin) {
  return <div
      data-spreadsheet-block={JSON.stringify({...attr, ...(admin&&{admin}||{})})}
    ></div>
}

registerBlockType( 'spreadsheet/block', {
    apiVersion: 2,
    title: 'Spreadsheet block',
    icon: 'spreadsheet',
    category: 'design',
    example: {},

    attributes: {
      spreadsheetURI: {
        type: 'string',
        default: ''
      },
      hide: {
        type: 'array',
        default: []
      },
      editable: {
        type: 'array',
        default: []
      },
      head: {
        type: 'array',
        default: []
      },
      values: {
        type: 'object',
        default: {}
      }
    },

    edit(props) {
      const {setAttributes, attributes, attributes: {spreadsheetURI, hide, editable, head, values}} = props

      const blockProps = useBlockProps( { style: blockStyle } );
      blockProps.className += ' components-placeholder is-large  spreadsheet-wrapper'

      const [isEditable, setEditable] = useState(false)
      const [isHead, setHead] = useState(false)
      const onSelectMedia = (media) => {
        console.log('onSelectMedia',media) // todo: remove log
        setAttributes({
          mediaId: media.id,
          spreadsheetURI: media.url
        })
      }

      const onExternalEvent = (e)=>{
        const {command, ...data} = e.detail
        console.log('onExternalEvent', e.detail) // todo: remove log
        const getCellIdFromData = data=>{
          const {col, row, sheetName} = data
          return getCellId(sheetName, col, row)
        }
        if (command==='hide') {
          const {param, checked} = data
          setAttributes( { hide: toggleEntry(hide, param, checked) } )
        } else if (command==='editable') {
          const {checked} = data
          setEditable(checked)
        } else if (command==='head') {
          const {checked} = data
          setHead(checked)
        } else if (command==='cell') {
          const cellId = getCellIdFromData(data)
          isEditable&&setAttributes( { editable: toggleEntry(editable, cellId) } )
          isHead&&setAttributes( { head: toggleEntry(head, cellId) } )
        } else if (command==='value') {
          const cellId = getCellIdFromData(data)
          setAttributes( { values: {...values, ...{[cellId]: e.detail.cellValue}} } )
        } else {
          console.log('onExternalEvent unknown command') // todo: remove log
        }
      }

      useEffect(()=>{
        console.log('spreadsheetURI', spreadsheetURI) // todo: remove lo
        init()
      }, [spreadsheetURI])

      useEffect(()=>{
        document.documentElement.addEventListener(spreadsheetEvent, onExternalEvent)
        return ()=>document.documentElement.removeEventListener(spreadsheetEvent, onExternalEvent)
      }, [setAttributes, isEditable, isHead, editable, head, values])

      return (<Fragment>
            <InspectorControls>
              <PanelBody
                  title={__('Select spreadsheet',ssb)}
                  initialOpen={true}
              >
                <MediaUploadCheck>
                  <MediaUpload
                      onSelect={ onSelectMedia }
                      allowedTypes={ ALLOWED_MEDIA_TYPES }
                      render={({open}) => (<Fragment><Button onClick={open}>
                        {__('Choose a spreadsheet',ssb)}
                      </Button></Fragment>)}
                  />
                </MediaUploadCheck>
              </PanelBody>
            </InspectorControls>
            <div {...blockProps}>{view(attributes, true)}</div>
          </Fragment>)
    },
    save(props) {
        useBlockProps.save( { style: blockStyle } )
        return view(props.attributes)
    }
})
