"use client"

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from './mobile.module.css';

interface FormData {
    name: string;
    phone: string;
    email: string;
}

interface FormErrors {
    name: number;
    phone: number;
    email: number;
}

export default function Mobile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formState, setFormState] = useState<'input' | 'success'>('input');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({
        name: 1,
        phone: 1,
        email: 1,
    });

    /* // commented bc it was bugging for me
    useEffect(() => {
        if (status !== 'loading' && !session || !session?.user?.admin) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session) {
        return null;
    }
    */

    /* validation funcs */
    const validateName = (name: string) => {
        if (!/^[a-zA-Z\s]*$/.test(name)) return 1;
        return 0;
    };

    const validatePhone = (phone: string) => {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length === 10 ? 0 : 1;
    };

    const validateEmail = (email: string) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 1;
        return 0;
    };

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    const isValidForm = () => {
        return formErrors.name === 0 && 
               formErrors.phone === 0 && 
               formErrors.email === 0
    };

    /* handlers */

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'phone') {
            processedValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        switch (name) {
            case 'name':
                setFormErrors(prev => ({ ...prev, name: validateName(processedValue) }));
                break;
            case 'phone':
                setFormErrors(prev => ({ ...prev, phone: validatePhone(processedValue) }));
                break;
            case 'email':
                setFormErrors(prev => ({ ...prev, email: validateEmail(processedValue) }));
                break;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidForm()) {
            console.error("Invalid Form Data")
            return;
        } 

        // convert phone to raw numbers
        const cleanedFormData = {
            ...formData,
            phone: formData.phone.replace(/\D/g, '') 
        };

        // TODO: form submitting
        try {
            // TODO: check if the applicant already applied
            const response = await fetch(`/api/applicants/${encodeURIComponent(formData.email)}`);        
            if (response.status === 404) { // email doesn't exist, add new applicant
            //     const createResponse = await fetch('/api/applicants', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //             ...cleanedFormData,
            //             starred: true
            //         }),
            //     });
    
            //     if (!createResponse.ok) {
            //         throw new Error('Failed to create new applicant');
            //     }
    
            } else { 
                // TODO: email DOES exist, star the existing applicant
            }



            setFormState('success');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    /* page returns */

    // successful submit
    if (formState === 'success') {
        return (
            <div className={styles.container}>
                <div className={styles.successContent}>
                    <span role="img" aria-label="celebration" className={styles.emoji}>
                        🎉
                    </span>
                    <h2>Thank you, {formData.name.split(' ')[0]}!</h2>
                    <p>We're looking forward to reviewing your application.</p>
                    <button 
                        className={styles.submitAnotherButton}
                        onClick={() => {
                            setFormState('input');
                            setFormData({ name: '', phone: '', email: '' });
                            setFormErrors({ name: 1, phone: 1, email: 1 });
                        }}>
                        <i>Submit another form</i>
                    </button>
                </div>
            </div>
        );
    }

    // form
    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="First Last"
                        value={formData.name}
                        onChange={handleInputChange}/>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="netid@tamu.edu"
                        value={formData.email}
                        onChange={handleInputChange}/>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="(xxx) xxx-xxxx"
                        value={formData.phone}
                        onChange={handleInputChange}/>
                </div>

                <button 
                    type="submit" 
                    className={`${styles.submitButton} ${!isValidForm() ? styles.submitButtonDisabled : ''}`}
                    disabled={!isValidForm()}>
                    Submit
                </button>
            </form>
        </div>
    );
}