import React, { useState, useEffect } from 'react'
import { registerBlockType } from '@wordpress/blocks'
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck
} from '@wordpress/block-editor'
import { PanelBody,   Button, TextControl } from '@wordpress/components'
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

console.log('zucht',23) // todo: remove log

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
      }
    },

    edit(props) {
      const {setAttributes, attributes, attributes: {spreadsheetURI, hide, editable, head}} = props

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

      const onClickAdmin = (e) => {
        console.log('onClickAdmin', e) // todo: remove log
        // const {target, currentTarget} = e.nativeEvent
        // const checkboxes = Array.from(target.querySelector('[type=checkbox]'))
        // checkboxes.forEach(input=>{
        //   const {name, checked} = input
        //   const [spreadsheet, command, value] = name.split(/_/g)
        //   console.log('name', name, checked, command, value) // todo: remove log
        // })
        // setAttributes( { foo: Math.random().toString() } )
      }

      const onExternalEvent = (e)=>{
        const {command, ...data} = e.detail
        console.log('onExternalEvent', e.detail) // todo: remove log
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
          const {col, row, sheetName} = data
          const cellId = getCellId(sheetName, col, row)
          isEditable&&setAttributes( { editable: toggleEntry(editable, cellId) } )
          isHead&&setAttributes( { head: toggleEntry(head, cellId) } )
        }
      }

      useEffect(()=>{
        console.log('spreadsheetURI ', spreadsheetURI) // todo: remove lo
        init()
      }, [spreadsheetURI])

      useEffect(()=>{
        document.documentElement.addEventListener(spreadsheetEvent, onExternalEvent)
        return ()=>document.documentElement.removeEventListener(spreadsheetEvent, onExternalEvent)
      }, [setAttributes, isEditable, isHead])

      // useEffect(()=>{
      //   document.documentElement.addEventListener('what',console.log.bind(console,'eeeh'))
      // }, [])

      return (<Fragment>
            <InspectorControls>
              <PanelBody
                  title={__('Select spreadsheet',ssb)}
                  initialOpen={true}
              >
                <MediaUploadCheck>
                  <MediaUpload
                      onSelect={ onSelectMedia }
                      // onSelect={ console.log.bind(console, 'selected') }
                      allowedTypes={ ALLOWED_MEDIA_TYPES }
                      render={({open}) => (<Fragment><Button onClick={open}>
                        {__('Choose a spreadsheet',ssb)}
                      </Button></Fragment>)}
                  />
                </MediaUploadCheck>
              </PanelBody>
            </InspectorControls>
            <div {...blockProps} onClick={onClickAdmin}>
              {view(attributes, true)}
            </div>
          </Fragment>)
    },
    save(props) {
        const {attributes, attributes: {spreadsheetURI, hide/*, linkLabel, foo*/}} = props
        const blockProps = useBlockProps.save( { style: blockStyle } )
        console.log('save',props.attributes) // todo: remove log
        return view(attributes)
    }
} )
