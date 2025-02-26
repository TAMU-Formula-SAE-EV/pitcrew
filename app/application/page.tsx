'use client'
import { useEffect, useState } from 'react';
import styles from './ApplicationForm.module.css';
import ApplicationSidebar from './ApplicationSidebar';
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

const ApplicationForm = () => {

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<FormDataState>({});
    const [subteamQuestions, setSubteamQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== 'loading' && !session || session?.user?.admin) {
            router.push('/');
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
        const currentFields =
            activeStep === 0
                ? CANDIDATE_INFO
                : activeStep === 1
                    ? GENERAL_QUESTIONS
                    : activeStep === 2
                        ? subteamQuestions
                        : [];

        let hasError = false;
        const newErrors: { [key: string]: string } = {};

        currentFields.forEach((field) => {
            const fieldValue = formData[field.id];

            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                hasError = true;
                newErrors[field.id] = 'This field is required.';
            }

            if (field.type === 'file' && !(fieldValue instanceof File)) {
                hasError = true;
                newErrors[field.id] = 'Please upload a valid file.';
            }
        });

        setErrors(newErrors);

        if (hasError) {
            return;
        }

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

    const handleSubmit = async () => {
        console.log('Submitted Data:', formData)
        router.push('/application/submitted')
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
                    <GroupedFieldsRenderer
                        fields={subteamQuestions}
                        onInputChange={handleInputChange}
                        formData={formData}
                        errors={errors}
                    />
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

    return (
        <div className={styles.container}>
            <ApplicationSidebar activeStep={activeStep} />
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
        </div>
    );
};

export default ApplicationForm;