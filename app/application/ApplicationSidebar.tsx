import styles from './ApplicationSidebar.module.css';
import Logo from "@/public/icons/logo.svg";
import VerticalLinearStepper from './VerticalStepper';
import Image from 'next/image';

interface SidebarProps {
    activeStep: number;
}

const ApplicationSidebar: React.FC<SidebarProps> = ({ activeStep }) => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}> 
                <Image
                    src={Logo}
                    alt="PitCrew Logo"
                />
            </div>
            <h2 className={styles.title}>FSAE EV Application</h2>
            <p className={styles.description}>
                Please make sure to complete the full application to the best of your ability.
            </p>
            <VerticalLinearStepper activeStep={activeStep} />

            {/* <div className={styles.footer}>Saved at 7:02pm</div> */}
        </div>
    );
};

export default ApplicationSidebar;
