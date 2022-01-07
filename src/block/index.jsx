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

import {init} from '../js/index'

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
      }
      // data: {
      //   type: 'object',
      //   default: {
      //     hide: [],
      //     editable: {},
      //     head: {}
      //   }
      // },
      // linkLabel: {
      //   type: 'string',
      //   default: ''
      // },
      // foo: {
      //   type: 'string',
      //   default: ''
      // }
    },

    edit(props) {
      const {setAttributes, attributes, attributes: {spreadsheetURI, hide}} = props

      const blockProps = useBlockProps( { style: blockStyle } );
      blockProps.className += ' components-placeholder is-large  spreadsheet-wrapper'

      // console.log('props',props) // todo: remove log
      // console.log('blockProps',blockProps) //  todo: remove log
      // console.log('this.foo',this.foo()) //  todo: remove log
      // console.log('this.foo',this) //  todo: remove log

      const onSelectMedia = (media) => {
        console.log('onSelectMedia',media) // todo: remove log
        setAttributes({
          mediaId: media.id,
          spreadsheetURI: media.url
        })
      }

      // const onChangeLinkLabel = ( newLinkLabel ) => {
      //   console.log('onChangeLinkLabel',newLinkLabel) // todo: remove log
      //   setAttributes( { linkLabel: newLinkLabel === undefined ? '' : newLinkLabel } )
      // }

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
        const {command, param, spreadsheet, checked} = e.detail
        console.log('onExternalEvent', {checked, command, param, spreadsheet}) // todo: remove log
        if (command==='hide') {
          const copy = hide.slice(0)
          const newHide = checked&&[...copy, param]||copy.filter(s=>s!==param) // todo might append
          setAttributes( { hide: newHide } )
        }
      }

      useEffect(()=>{
        console.log('spreadsheetURI ', spreadsheetURI) // todo: remove lo
        init()
      }, [spreadsheetURI])

      useEffect(()=>{
        document.documentElement.addEventListener('what', onExternalEvent)
        return ()=>document.documentElement.removeEventListener('what', onExternalEvent)
      }, [setAttributes])

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
              {/*<PanelBody>
                <div>
                  <fieldset>
                    <TextControl
                      label={__( 'Link label', ssb )}
                      value={ linkLabel }
                      onChange={ onChangeLinkLabel }
                      help={ __( 'Add link label', ssb )}
                    />
                  </fieldset>
                </div>
              </PanelBody>*/}
            </InspectorControls>
            <div {...blockProps} onClick={onClickAdmin}>
              {view(attributes, true)}
            </div>
          </Fragment>)
    },
    save(props) {
        const {attributes, attributes: {spreadsheetURI, hide/*, linkLabel, foo*/}} = props
        const blockProps = useBlockProps.save( { style: blockStyle } )
        console.log('save',{props,blockProps}) // todo: remove log
        return view(attributes)
    }
} )
