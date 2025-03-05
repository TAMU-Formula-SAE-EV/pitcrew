import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';

const steps = [
    { label: 'Schedule Time' },
    { label: 'Design Challenge' },
];

interface StepperProps {
    activeStep: number;
}

export default function ScheduleInterviewStepper({ activeStep }: StepperProps) {
    return (
        <Box sx={{ maxWidth: 400 }}>
            <Stepper
                activeStep={activeStep}
                orientation="vertical"
                sx={{
                    '& .MuiStepLabgel-label': { color: 'black' },
                    '& .MuiStepIcon-root': { color: 'black' },
                    '& .Mui-active .MuiStepIcon-root': { color: 'black' },
                    '& .Mui-completed .MuiStepIcon-root': { color: 'black' }
                }}
            >
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>
                            {step.label}
                        </StepLabel>
                        <StepContent>
                            <Typography>Step {index + 1} of {steps.length}</Typography>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
