import styles from './ApplicationSidebar.module.css';
import Logo from "@/public/icons/logo.svg";
import VerticalLinearStepper from './VerticalStepper';
import Image from 'next/image';

interface SidebarProps {
  activeStep: number;
  lastSavedTime?: string;
}

const ApplicationSidebar: React.FC<SidebarProps> = ({ activeStep, lastSavedTime }) => {

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
      <div className={styles.footer}>
        {lastSavedTime ? `Saved at ${lastSavedTime}` : 'Not saved yet'}
      </div>
    </div>
  );
};

export default ApplicationSidebar;