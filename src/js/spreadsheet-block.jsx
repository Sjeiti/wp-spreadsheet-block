import React, { useState, useEffect } from 'react'
import { registerBlockType } from '@wordpress/blocks'
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck
} from '@wordpress/block-editor'
import { PanelBody, Button, TextControl } from '@wordpress/components'
import { Fragment } from '@wordpress/element'
import { __ } from '@wordpress/i18n'

// const __ = s=>s
const ssb = 'ssb'
// const ALLOWED_MEDIA_TYPES = [ '.xlsx', '.xls', '.csv' ]
// const ALLOWED_MEDIA_TYPES = [ 'xlsx', 'xls', 'csv' ]
// const ALLOWED_MEDIA_TYPES = [ 'documents' ]
const ALLOWED_MEDIA_TYPES = [ ]

const blockStyle = {
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 0 0 1px solid inset'
}

registerBlockType( 'spreadsheet/block', {
    apiVersion: 2,
    title: 'Spreadsheet block',
    icon: 'spreadsheet',
    category: 'design',
    example: {},

    attributes: {
      mediaUrl: {
        type: 'string',
        default: ''
      },
      linkLabel: {
        type: 'string',
        default: ''
      }
    },

    foo() {
      return 23
    },

    edit(props) {
      const {setAttributes, attributes: {mediaUrl, linkLabel}} = props
      const blockProps = useBlockProps( { style: blockStyle } );
      blockProps.className += ' components-placeholder is-large'

      console.log('props',props) // todo: remove log
      console.log('blockProps',blockProps) //  todo: remove log
      // console.log('this.foo',this.foo()) //  todo: remove log
      console.log('this.foo',this) //  todo: remove log

      const onSelectMedia = (media) => {
        console.log('onSelectMedia',media) // todo: remove log
        setAttributes({
          mediaId: media.id,
          mediaUrl: media.url
        })
      }

      const onChangeLinkLabel = ( newLinkLabel ) => {
        console.log('onChangeLinkLabel',newLinkLabel) // todo: remove log
        setAttributes( { linkLabel: newLinkLabel === undefined ? '' : newLinkLabel } )
      }

      useEffect(()=>{
        console.log('mediaUrl',mediaUrl) // todo: remove log
      }, [mediaUrl])

      // useEffect(()=>{
      //   console.log('poepjes') // todo: remove log
      //   setAttributes({poep:23})
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
              <PanelBody>
                <div>
                  <fieldset>
                    <TextControl
                      label={__( 'Link label', 'my-affiliate-block' )}
                      value={ linkLabel }
                      onChange={ onChangeLinkLabel }
                      help={ __( 'Add link label', 'my-affiliate-block' )}
                    />
                  </fieldset>
                </div>
              </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
              <p>{mediaUrl}</p>
              <p>{linkLabel}</p>
              <div className="components-placeholder__label">Spreadsheet</div>
            </div>
          </Fragment>)
    },
    save(props) {
        const {attributes: {mediaUrl, linkLabel}} = props
        const blockProps = useBlockProps.save( { style: blockStyle } )
        console.log('save',{props,blockProps}) // todo: remove log
        return (
            <div { ...blockProps }>
              <p>{mediaUrl}</p>
              <p>{linkLabel}</p>
              Hello World (from the frontend).
            </div>
        )
    }
} )
