import { registerBlockType } from '@wordpress/blocks'
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck
} from '@wordpress/block-editor'
import { PanelBody, Button } from '@wordpress/components'
import { Fragment } from '@wordpress/element'

const __ = s=>s
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
    edit(props) {
      const blockProps = useBlockProps( { style: blockStyle } );
      blockProps.className += ' components-placeholder is-large'

      console.log('props',props) // todo: remove log
      // console.log('blockProps',blockProps) //  todo: remove log

      const onSelectMedia = (media) => {
        console.log('onSelectMedia',media) // todo: remove log
        props.setAttributes({
          mediaId: media.id,
          mediaUrl: media.url
        });
      }

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
            <div {...blockProps}>
              <div className="components-placeholder__label">Spreadsheet</div>
            </div>
          </Fragment>)
    },
    save(props) {
        const blockProps = useBlockProps.save( { style: blockStyle } );
        console.log('save.props',props) // todo: remove log
        return (
            <div { ...blockProps }>
              {props.attributes.mediaUrl}
              Hello World (from the frontend).
            </div>
        )
    }
} )
