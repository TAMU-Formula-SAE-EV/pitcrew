'use client'
import { useEffect, useState } from 'react';
import styles from './ApplicationForm.module.css';
import ApplicationSidebar from '@/components/application/ApplicationSidebar';
import { CANDIDATE_INFO, GENERAL_QUESTIONS, Question, Subteam, SUBTEAM_QUESTIONS } from '@/constants/questions';
import Select from 'react-select';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Upload from '@/public/icons/upload.svg';

type FormDataState = {
    [key: string]: string | File | null;
};

type Error = {
    [key: string]: string;
}

interface GroupedFieldsRendererProps {
    fields: Question[];
    onInputChange?: (fieldId: string, value: string | File | null) => void;
    formData?: FormDataState;
    errors: Error;
    reviewMode?: boolean;
}

interface GroupedFields {
    [key: string]: Question[];
}

const groupFieldsByGroup = (fields: Question[]): GroupedFields => {
    return fields.reduce((acc, field) => {
        if (!acc[field.group]) {
            acc[field.group] = [];
        }
        acc[field.group].push(field);
        return acc;
    }, {} as GroupedFields);
};

const GroupedFieldsRenderer = ({
    fields,
    onInputChange,
    formData,
    errors,
    reviewMode = false
}: GroupedFieldsRendererProps) => {
    const groupedFields = groupFieldsByGroup(fields);

    return (
        <>
            {Object.keys(groupedFields).map((group) => (
                <div key={group} className={styles.groupRow}>
                    {groupedFields[group].map((field) => (
                        <div key={field.id} className={`${styles.inputGroup} ${field.type === "text-area" ? styles.textareaGroup : ""}`}>
                            <label>{field.question}</label>
                            {reviewMode ? (
                                <p className={styles.reviewText}>
                                    {field.type === 'file'
                                        ? formData?.[field.id] instanceof File
                                            ? (formData[field.id] as File).name
                                            : 'No file uploaded'
                                        : `${formData?.[field.id] || 'N/A'}`}
                                </p>
                            ) : (
                                <>
                                    {field.type === 'text' ? (
                                        <input
                                            type="text"
                                            placeholder={field.question}
                                            value={formData?.[field.id] as string || ''}
                                            onChange={(e) => onInputChange?.(field.id, e.target.value)}
                                        />
                                    ) : field.type === 'text-area' ? (
                                        <textarea
                                            placeholder={field.question}
                                            value={formData?.[field.id] as string || ''}
                                            onChange={(e) => onInputChange?.(field.id, e.target.value)}
                                        />
                                    ) : field.type === 'select' ? (
                                        <Select
                                            instanceId={`select-${field.id}`}
                                            options={field.options?.map((option) => ({
                                                label: option,
                                                value: option,
                                            }))}
                                            value={
                                                formData?.[field.id]
                                                    ? { label: formData[field.id], value: formData[field.id] }
                                                    : null
                                            }
                                            onChange={(option) => onInputChange?.(field.id, option!.value as string)}
                                        />
                                    ) : field.type === 'file' ? (
                                        <>
                                            <div className={styles.uploadBox}>
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        if (file && file.type === 'application/pdf') {
                                                            onInputChange?.(field.id, file);
                                                        } else {
                                                            alert('Please upload a valid PDF file.');
                                                        }
                                                    }}
                                                    id={field.id}
                                                />
                                                <label htmlFor={field.id}>
                                                    <Image
                                                        src={Upload}
                                                        alt='Upload'
                                                        height={36}
                                                        width={36}
                                                    />
                                                </label>
                                            </div>
                                            {formData?.[field.id] instanceof File && (
                                                <div className={styles.fileName}>{(formData[field.id] as File).name}</div>
                                            )}
                                        </>
                                    ) : null}
                                    {errors[field.id] && <p className={styles.error}>{errors[field.id]}</p>}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
};

interface SavedFileMetadata {
    type: 'file';
    name: string;
    size: number;
    lastModified: number;
    data?: string;
}

type SavedFormData = Record<string, string | null | SavedFileMetadata>;

// saving form and file to local storage so data is preserved on reload
const saveToLocalStorage = (formData: FormDataState, activeStep: number) => {
    const dataToSave: SavedFormData = {};

    const filePromises: Promise<void>[] = [];

    Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
            dataToSave[key] = {
                type: 'file',
                name: value.name,
                size: value.size,
                lastModified: value.lastModified
            };

            const filePromise = new Promise<void>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result && typeof reader.result === 'string') {
                        (dataToSave[key] as SavedFileMetadata).data = reader.result;
                    }
                    resolve();
                };
                reader.onerror = () => {
                    console.error(`Failed to read file ${value.name}`);
                    resolve();
                };
                reader.readAsDataURL(value);
            });

            filePromises.push(filePromise);
        } else {
            dataToSave[key] = value;
        }
    });

    // wait for file conversions, then save to localStorage
    Promise.all(filePromises).then(() => {
        try {
            localStorage.setItem('applicationFormData', JSON.stringify(dataToSave));
            localStorage.setItem('applicationFormStep', activeStep.toString());
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            // if file too large, try saving without file data
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                // remove file data and try again
                Object.keys(dataToSave).forEach(key => {
                    if ((dataToSave[key] as SavedFileMetadata)?.type === 'file') {
                        delete (dataToSave[key] as SavedFileMetadata).data;
                    }
                });
                try {
                    localStorage.setItem('applicationFormData', JSON.stringify(dataToSave));
                    console.warn('Saved form data without file contents due to storage limitations. If you leave the page, you may have to reupload the file.');
                } catch (innerError) {
                    console.error('Failed to save even without file data:', innerError);
                }
            }
        }
    });
};

const loadFromLocalStorage = (): { formData: FormDataState, activeStep: number } => {
    try {
        const savedFormData = localStorage.getItem('applicationFormData');
        const savedStep = localStorage.getItem('applicationFormStep');

        const formData: FormDataState = {};

        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData) as SavedFormData;

            Object.entries(parsedData).forEach(([key, value]) => {
                if (value && typeof value === 'object' && value.type === 'file' && value.data) {
                    try {
                        const base64Data = (value.data as string).split(',')[1];
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);

                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        const blob = new Blob([bytes]);

                        const file = new File([blob], value.name, {
                            type: 'application/pdf',
                            lastModified: value.lastModified
                        });

                        formData[key] = file;
                    } catch (err) {
                        console.error(`Failed to reconstruct file for ${key}:`, err);
                        // set to null if reconstruction fails
                        formData[key] = null;
                    }
                } else {
                    // for non-file values, store directly
                    formData[key] = value as string | null;
                }
            });
        }

        return {
            formData,
            activeStep: savedStep ? parseInt(savedStep, 10) : 0
        };
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return { formData: {}, activeStep: 0 };
    }
};

const ApplicationForm = () => {
    const [initialized, setInitialized] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<string>('');
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<FormDataState>({});
    const [subteamQuestions, setSubteamQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: session, status, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && !initialized) {
            const { formData: savedData, activeStep: savedStep } = loadFromLocalStorage();
            setFormData(savedData);
            setActiveStep(savedStep);
            setInitialized(true);
        }
    }, [initialized]);

    const formatCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes}${ampm}`;
    };

    useEffect(() => {
        if (initialized && Object.keys(formData).length > 0) {
            saveToLocalStorage(formData, activeStep);
            setLastSavedTime(formatCurrentTime());
        }
    }, [formData, activeStep, initialized]);

    useEffect(() => {
        if (status !== 'loading' && !session || session?.user?.admin) {
            router.push('/');
        }
        if (session && session.user.status === 'APPLIED') {
            router.push('/application/submitted');
        }
    }, [session, status, router]);

    useEffect(() => {
        const firstChoice = formData?.first_choice;
        const secondChoice = formData?.second_choice;

        if (firstChoice && SUBTEAM_QUESTIONS[(firstChoice as string).toLowerCase() as Subteam]) {
            setSubteamQuestions(SUBTEAM_QUESTIONS[(firstChoice as string).toLowerCase() as Subteam]);
        }

        if (secondChoice && SUBTEAM_QUESTIONS[(secondChoice as string).toLowerCase() as Subteam]) {
            setSubteamQuestions((prev) => [...prev, ...SUBTEAM_QUESTIONS[(secondChoice as string).toLowerCase() as Subteam]]);
        }
    }, [formData?.first_choice, formData?.second_choice]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session) {
        return null;
    }

    const handleNext = () => {
        setActiveStep((prev) => Math.min(prev + 1, 3));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleInputChange = (fieldId: string, value: string | File | null) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const formatFormData = (formData: FormDataState) => {
        const { first_choice, second_choice, ...rest } = formData;

        const subteamsApplied: Record<string, Record<string, string | number>> = {
            [first_choice as string]: { preferenceOrder: 1 },
            [second_choice as string]: { preferenceOrder: 2 }
        };

        Object.keys(formData).forEach((key) => {
            if (key.startsWith(first_choice as string)) {
                subteamsApplied[first_choice as string][key] = formData[key] as string;
            } else if (key.startsWith(second_choice as string)) {
                subteamsApplied[second_choice as string][key] = formData[key] as string;
            }
        });

        const generalResponses: Record<string, string> = {};
        const generalResponseIds = GENERAL_QUESTIONS
            .map((q) => q.id)
            .filter((id) => id !== "first_choice" && id !== "second_choice");

        Object.keys(rest).forEach((key) => {
            if (generalResponseIds.includes(key)) {
                generalResponses[key] = rest[key] as string;
                delete rest[key];
            }
        });

        const cleanedRest = Object.fromEntries(
            Object.entries(rest).filter(([key]) => !key.includes("-q"))
        );

        const applicantId = session.user.id;

        return {
            applicantId,
            subteamsApplied,
            generalResponses,
            ...cleanedRest,
        };
    };

    const validateAllFields = () => {
        const newErrors: { [key: string]: string } = {};
        const stepsWithErrors: number[] = [];

        // Validate Candidate Info fields
        CANDIDATE_INFO.forEach((field) => {
            const fieldValue = formData[field.id];
            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                newErrors[field.id] = 'This field is required.';
                stepsWithErrors.push(0)
            }
            if (field.type === 'file' && !(fieldValue instanceof File)) {
                newErrors[field.id] = 'Please upload a valid file.';
                stepsWithErrors.push(0);
            }
        });

        GENERAL_QUESTIONS.forEach((field) => {
            const fieldValue = formData[field.id];
            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                newErrors[field.id] = 'This field is required.';
                stepsWithErrors.push(1);
            }
        });

        subteamQuestions.forEach((field) => {
            const fieldValue = formData[field.id];
            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                newErrors[field.id] = 'This field is required.';
                stepsWithErrors.push(2);
            }
        });

        setErrors(newErrors);

        if (stepsWithErrors.length === 0) {
            return null;
        }

        return Math.min(...stepsWithErrors);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const firstErrorStep = validateAllFields();
        if (firstErrorStep !== null) {
            // Navigate to the first step with errors
            setActiveStep(firstErrorStep);
            setIsSubmitting(false);
            return;
        }

        const formattedFormData = formatFormData(formData);
        console.log('Initial Data:', formattedFormData);

        const fileData = new FormData();
        fileData.append('file', formattedFormData.resume);
        console.log(fileData);

        const uploadResponse = await fetch('/api/file-upload', {
            method: 'POST',
            body: fileData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
            console.error("File upload failed:", uploadResult.error);
            setIsSubmitting(false);
            return;
        }

        formattedFormData.resume = uploadResult.url;

        const response = await fetch('/api/applicants/submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedFormData),
        });

        console.log('Submitted Data: ', response);

        if (response.ok) {
            await update();
            router.push('/application/submitted');
            localStorage.removeItem('applicationFormData');
            localStorage.removeItem('applicationFormStep');
        } else {
            console.error("Form submission failed:", await response.json());
        }
        setIsSubmitting(false);
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <GroupedFieldsRenderer
                        fields={CANDIDATE_INFO as Question[]}
                        onInputChange={handleInputChange}
                        formData={formData}
                        errors={errors}
                    />
                );
            case 1:
                return (
                    <GroupedFieldsRenderer
                        fields={GENERAL_QUESTIONS as Question[]}
                        onInputChange={handleInputChange}
                        formData={formData}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <>
                        {(!formData.first_choice || !formData.second_choice) ? (
                            <p> Please select all subteam preferences on the previous page. </p>
                        ) : (
                            <GroupedFieldsRenderer
                                fields={subteamQuestions}
                                onInputChange={handleInputChange}
                                formData={formData}
                                errors={errors}
                            />
                        )}
                    </>
                );
            case 3:
                return (
                    <>
                        <b>Candidate Information</b>
                        <GroupedFieldsRenderer
                            fields={CANDIDATE_INFO as Question[]}
                            formData={formData}
                            errors={errors}
                            reviewMode={true}
                        />
                        <hr className={styles.divider} />
                        <b>Full Team Questions</b>
                        <GroupedFieldsRenderer
                            fields={GENERAL_QUESTIONS as Question[]}
                            formData={formData}
                            errors={errors}
                            reviewMode={true}
                        />
                        <hr className={styles.divider} />
                        <b>Subteam Questions</b>
                        {subteamQuestions.length > 0 && (
                            <GroupedFieldsRenderer
                                fields={subteamQuestions}
                                formData={formData}
                                errors={errors}
                                reviewMode={true}
                            />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    const handleStepClick = (stepIndex: number) => {
        setActiveStep(stepIndex);
    };

    return (
        <div className={styles.container}>
            {isSubmitting ? (
                <div>
                    <p>Submitting...</p>
                </div>
            ) : (
                <>
                    <ApplicationSidebar
                        activeStep={activeStep}
                        lastSavedTime={lastSavedTime}
                        onStepClick={handleStepClick}
                    />
                    <div className={styles.formContainer}>
                        <div className={styles.formGrid}>
                            {renderStepContent()}
                        </div>
                        <div className={styles.buttons}>
                            <button
                                className={styles.backButton}
                                onClick={handleBack}
                                disabled={activeStep === 0}
                            >
                                Back
                            </button>
                            <button
                                className={styles.nextButton}
                                onClick={activeStep === 3 ? handleSubmit : handleNext}
                            >
                                {activeStep === 3 ? "Submit" : "Next Step"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ApplicationForm;