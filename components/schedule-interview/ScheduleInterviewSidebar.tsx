import styles from './ScheduleInterviewSidebar.module.css';
import Logo from "@/public/icons/logo.svg";
import ScheduleInterviewStepper from './ScheduleInterviewStepper';
import Image from 'next/image';

interface SidebarProps {
  activeStep: number;
  onStepClick: (step: number) => void;
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
        Select an available time slot. You&apos;ll receive an email from tamuformulae@gmail.com with your interview location at ZACH sometime before your interview. Please check your inbox regularly for this information.
      </p>
      <ScheduleInterviewStepper activeStep={activeStep} />
      <div className={styles.additionalInfo}>
        <div>
          <p> Application process questions? </p>
          <p> Email tamuformulae@gmail.com </p>
        </div>
        <div>
          <p> Need tech support? </p>
          <p> Email tamuformulacs@gmail.com </p>
        </div>
      </div>
    </div >
  );
};

export default ApplicationSidebar;