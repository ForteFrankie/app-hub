import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Card, CardText} from 'material-ui/Card';
import Button from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import {DHISVersions} from '../../../config';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import UploadFileField from '../form/UploadFileField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Field, FormSection, reduxForm, getFormSyncErrors} from 'redux-form';
import * as formUtils from './ReduxFormUtils';
import {validateZipFile, validateImageFile, validateURL} from '../form/ReduxFormUtils';
import Spinner from '../utils/Spinner';
import Stepper from 'material-ui/Stepper/Stepper';
import Step from 'material-ui/Stepper/Step';
import StepButton from 'material-ui/Stepper/StepButton';
import StepLabel from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import {red500} from 'material-ui/styles/colors';
import _size from 'lodash/size';
import _keys from 'lodash/keys';
import _max from 'lodash/max';

const appTypes = [{value: 'APP_STANDARD', label: 'Standard'}, {value: 'APP_DASHBOARD', label: 'Dashboard'},
    {value: 'APP_TRACKER_DASHBOARD', label: 'Tracker Dashboard'}]

const requiredFields = {
    general: ['appName', 'appType'],
    version: ['file', 'version'],
    developer: ['developerName', 'developerOrg'],
    image: [],
}

const varCharFields = {
    general: ['appName', 'appType', 'sourceUrl'],
    version: ['version', 'minVer', 'maxVer'],
    developer: ['developerName', 'developerEmail', 'developerOrg'],
    image: ['imageCaption', 'imageDescription']
}

const validateSection = (values, section) => {
    const errors = {};
    requiredFields[section].forEach(field => {
        if (!values) {
            errors[field] = 'Required';
            return;
        }
        if (!values[field]) {
            errors[field] = 'Required'
        }
    })

    varCharFields[section].forEach(field => {
        if (values && values[field] && values[field].length > 255) {
            errors[field] = 'Max 255 characters';
        }
    })

    return errors;
}

const hasError = errors => _keys(errors).find(key => _size(errors[key]) > 0) !== undefined


const validate = values => {
    const errors = {};
    errors.general = validateSection(values.general, 'general');
    errors.version = validateSection(values.version, 'version');
    errors.developer = validateSection(values.developer, 'developer');
    errors.image = validateSection(values.image, 'image');

    if (values.version && values.version.minVer && values.version.maxVer && values.version.minVer > values.version.maxVer) {
        errors.version.minVer = 'Cannot be higher than maximum version';
        errors.version.maxVer = 'Cannot be lower than minimum version'
    }
    //Check if any subsection has error
    console.log(hasError(errors))
    if(hasError(errors)) {
        errors._error = "Your submission contains an error. Please check previous steps and try again."
    }
    return errors
}

const appTypesItems = appTypes.map((type, i) => (
    <MenuItem key={type.value} value={type.value} primaryText={type.label}/>
));
const DHISVersionItems = DHISVersions.map((version, i) => (
    <MenuItem key={version} value={version} primaryText={version}/>
))

const AppGeneralSection = (props) => {

    return (
        <div>
            <Field name="appName" component={formUtils.renderTextField} autoFocus fullWidth
                   label="App Name *"
            />
            <Field name="description" component={formUtils.renderTextField} fullWidth multiLine
                   rows={1}
                   label="App Description"/>
            <br />
            <Field name="sourceUrl" component={formUtils.renderTextField} label="Source Code URL"
                   validate={validateURL}/>
            <br />
            <Field name="appType" component={formUtils.renderSelectField} label="App Type">
                {appTypesItems}
            </Field>
        </div>
    )
}

AppGeneralSection.propTypes = {
    name: PropTypes.string
}

AppGeneralSection.defaultProps = {
    name: 'general'
}

const AppVersionSection = (props) => {

    return (
        <div>
            <Field name="version" component={formUtils.renderTextField} autoFocus label="Version *"/>
            <br />
            <Field name="minVer" component={formUtils.renderSelectField}
                   label="Minimum DHIS version">
                {DHISVersionItems}
            </Field>
            <br />
            <Field name="maxVer" component={formUtils.renderSelectField}
                   label="Maximum DHIS version">
                {DHISVersionItems}
            </Field>
            <br />
            <Field name="demoUrl" component={formUtils.renderTextField}
                   label="Demo URL"
                   validate={validateURL}>
            </Field>

            <br />
            <Field name="file" style={{height: 72}} component={formUtils.renderUploadField}
                   accept=".zip"
                   validate={validateZipFile}
                   label="Upload app *"/>
        </div>
    )
}

AppVersionSection.propTypes = {
    name: PropTypes.string,
    formState: PropTypes.object
}

AppVersionSection.defaultProps = {
    name: 'version'
}

const AppDeveloperSection = (props) => {

    return (
        <div>
            <Field name="developerName" autoFocus component={formUtils.renderTextField}
                   label="Developer Name *"/>
            <br />
            <Field name="developerEmail" component={formUtils.renderTextField}
                   label="Developer Email"/>
            <br />
            <Field name="developerOrg" component={formUtils.renderTextField}
                   label="Organisation *"/>
        </div>
    )
}

AppDeveloperSection.propTypes = {
    name: PropTypes.string
}

AppDeveloperSection.defaultProps = {
    name: 'developer'
}

const AppImageSection = (props) => {
    const {submitting, pristine} = props.formState;
    return (
        <div>
            <p>You can upload additional images and set preview image once your app has been uploaded.</p>
            <Field name="image" component={formUtils.renderUploadField} accept="image/*" hintText="Upload logo"
                   validate={validateImageFile}
                   id="imageFile"/>
            <br />
            <Field name="imageCaption" component={formUtils.renderTextField} label="Image caption"/>
            <br />
            <Field name="imageDescription" component={formUtils.renderTextField}
                   label="Image description"/>
            <br />

        </div>
    )
}

AppImageSection.propTypes = {
    name: PropTypes.string
}

AppImageSection.defaultProps = {
    name: 'image'
}

class UploadAppFormStepper extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stepIndex: 0,
            lastStep: 3,
            completed: [],
            visited: [],
            sections: ['general', 'version', 'developer', 'image']
        }

        this.getStepContent = this.getStepContent.bind(this);
        this.updateStateForStep = this.updateStateForStep.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.prevStep = this.prevStep.bind(this);
        this.goToStep = this.goToStep.bind(this);
    }

    onSubmit(values) {
        console.log(values)
        const data = {
            name: values.general.appName,
            description: values.general.description,
            appType: values.general.appType,
            sourceUrl: values.general.sourceUrl,
            developer: {
                name: values.developer.developerName,
                email: values.developer.developerEmail,
                address: values.developer.developerAddress || "",
                organisation: values.developer.developerOrg,
            },
            versions: [{
                version: values.version.version,
                minDhisVersion: values.version.minVer,
                maxDhisVersion: values.version.maxVer,
                demoUrl: values.version.demoUrl,
            }],
            images: [{
                caption: values.image ? values.image.imageCaption : '',
                description: values.image ? values.image.imageDescription : '',
            }]
        }
        const imageFile = values.image && values.image.image ? values.image.image[0] : [];
        data.images = imageFile ? data.images : [];
        const appFile = values.version.file[0];


        this.props.submitted({data, file: appFile, image: imageFile});
    }

    getStepContent(index) {
        const {handleSubmit, submitted, submitFailed, pristine, reset, dirty, submitting} = this.props;
        const formState = {
            submitted,
            submitFailed,
            pristine,
            reset,
            dirty,
            submitting
        }

        const errors = this.props.errorState ? this.props.errorState[this.state.sections[index]] : {};
        switch (index) {

            case 0:
                return (<FormSection name={this.state.sections[index]}>
                    <AppGeneralSection formState={formState} error={errors}/>
                </FormSection>)
            case 1:
                return (
                    <FormSection name={this.state.sections[index]}>
                        <AppVersionSection formState={formState} error={errors}/>
                    </FormSection>)
            case 2:
                return (
                    <FormSection name={this.state.sections[index]}>
                        <AppDeveloperSection formState={formState} error={errors}/>
                    </FormSection>)
            case 3:
                return (
                    <FormSection name={this.state.sections[index]}>
                        <AppImageSection formState={formState} error={errors}/>
                    </FormSection>)
            default:
                'Da fuck bruh'
        }


    }

    updateStateForStep(nextStep) {
        const currStep = this.state.stepIndex;
        const currSection = this.state.sections[currStep];
        const errorFields = this.props.errorState[currSection];
        const completedIndex = this.state.completed.indexOf(currStep);
        const completedWithoutCurrent = this.state.completed.filter(step => step !== currStep);
        this.setState({
            ...this.state,
            stepIndex: nextStep,
            completed: hasError(errorFields) ? completedWithoutCurrent : completedWithoutCurrent.concat(currStep),
            visited: this.state.visited.concat(currStep)
        });
    }

    nextStep() {
        const currIndex = this.state.stepIndex;
        const currSection = this.state.sections[currIndex];
        const errorFields = this.props.errorState[currSection];
        const errorFieldNames = Object.keys(errorFields).map((field, i) => `${currSection}.${field}`);
        //Touch all fields that has an error, so that the fields are updated to show the error
        //and prevent transition
        if (errorFieldNames.length > 0) {

            this.props.touch(...errorFieldNames);
            return;
        }

        this.updateStateForStep(currIndex + 1);

    }

    prevStep() {
        let currIndex = this.state.stepIndex;
        this.setState({
            ...this.state,
            stepIndex: currIndex > 0 ? --currIndex : 0,
        });
    }

    goToStep(index) {
        //if (index > this.state.stepIndex && this.props.invalid) return;
        if (index > this.state.lastStep && index > -1) {
            throw new Error(`Index must be between 0 and ${this.state.lastStep} (including).`)
        }

        this.updateStateForStep(index);

    }

    render() {
        const {handleSubmit, submitted, submitFailed, pristine, error, invalid, valid, reset, dirty, submitting} = this.props;
        const sectionErrorIcon = (<WarningIcon color={red500} />);

        const steps = this.state.sections.map((section, i) => {
            const showError = (i < this.state.stepIndex || this.state.visited.indexOf(i) > -1 || _max(this.state.visited) > i )
                && this.props.errorState && hasError(this.props.errorState[section])
            const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
            return (
            <Step key={section} completed={this.state.completed.indexOf(i) > -1}>
                <StepButton onClick={() => this.goToStep(i)} {...(showError && {icon: sectionErrorIcon})} >
                    {sectionName}
                </StepButton>
            </Step>
        )});

        return (
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Stepper activeStep={this.state.stepIndex} linear={false}>
                    {steps}
                </Stepper>

                <div>
                    {this.getStepContent(this.state.stepIndex)}
                </div>
                {submitFailed && this.state.stepIndex == this.state.lastStep && (<p style={{color: red500}}>{error}</p>)}
                <div>
                {this.state.stepIndex > 0 && (<RaisedButton
                    label="Back"
                    primary={true}
                    onTouchTap={this.prevStep}
                />)}
                {this.state.stepIndex < this.state.lastStep && (
                    <RaisedButton
                        label="Continue"
                        primary={true}
                        onTouchTap={this.nextStep}
                    />)}
                {this.state.stepIndex === this.state.lastStep && (
                    <Button style={{marginTop: '20px'}}
                            icon={submitting ? <Spinner inButton/> : null}
                            type="submit"
                            primary
                            disabled={submitting}
                            label={!submitting ? "Finish" : null}/>
                )}
                </div>
            </form>

        )
    }
}
UploadAppFormStepper.propTypes = {
    submitted: PropTypes.func.isRequired,
    form: PropTypes.string.isRequired,
}

UploadAppFormStepper.defaultProps = {
    initialValues: {general: {appType: appTypes[0].value}}
}

const mapStateToProps = (state, ownProps) => ({
    form: ownProps.form,
    initialValues: ownProps.initialValues || UploadAppFormStepper.defaultProps.initialValues,
    errorState: getFormSyncErrors('uploadAppFormStepper')(state),
    valid: false,
    validate
})
const ReduxFormConnected = reduxForm({})(UploadAppFormStepper);
export default connect(mapStateToProps)(ReduxFormConnected);