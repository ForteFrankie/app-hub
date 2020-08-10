import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as dialogTypes from '../../constants/dialogTypes'
import NewAppVersionDialog from './NewAppVersionDialog'
import EditAppDialog from './EditAppDialog'
import ConfirmDeleteAppDialog from './ConfirmDeleteAppDialog'
import EditImageDialog from './EditImageDialog'
import ConfirmGeneric from './ConfirmGeneric'
import AddOrganisationMemberDialog from './AddOrganisationMemberDialog'
import NewOrganisationDialog from './NewOrganisationDialog'

const DialogComponents = {}
DialogComponents[dialogTypes.NEW_VERSION] = NewAppVersionDialog
DialogComponents[dialogTypes.CONFIRM_DELETE_APP] = ConfirmDeleteAppDialog
DialogComponents[dialogTypes.EDIT_APP] = EditAppDialog
DialogComponents[dialogTypes.EDIT_IMAGE] = EditImageDialog
DialogComponents[dialogTypes.CONFIRM_GENERIC] = ConfirmGeneric
DialogComponents[dialogTypes.ADD_ORGANISATION_MEMBER] = AddOrganisationMemberDialog
DialogComponents[dialogTypes.NEW_ORGANISATION_DIALOG] = NewOrganisationDialog

class DialogRoot extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { dialogType, dialogProps } = this.props
        if (!dialogType) {
            return null
        }
        const DialogType = DialogComponents[dialogType]
        return DialogType ? <DialogType {...dialogProps} /> : null
    }
}

DialogRoot.propTypes = {
    dialogType: PropTypes.string,
}

const mapStateToProps = state => ({
    dialogType: state.dialog.dialogType,
    dialogProps: state.dialog.dialogProps,
})

export default connect(mapStateToProps)(DialogRoot)
