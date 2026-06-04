import { Phone, MobileSlideshow } from './index-phone';
import { CalculatorScreen, HomeScreen, SosScreen, ChatScreen, AidScreen } from './index-screens';
import styles from '../../styles/marketing/marketing.module.css';

function Capability({ flip = false, label, title, lead, screen, items, callout }) {
  return (
    <div className={`${styles.capability} ${flip ? styles.capabilityFlip : ''} ${styles.reveal}`} data-reveal>
      <div className={styles.capPhone}><Phone float callout={callout}>{screen}</Phone></div>
      <div className={styles.capText}>
        <span>{label}</span>
        <h3>{title}</h3>
        <p>{lead}</p>
        <div className={styles.capList}>
          {items.map(([itemTitle, copy]) => (
            <div className={styles.capItem} key={itemTitle}>
              <span>•</span>
              <div><strong>{itemTitle}</strong><small>{copy}</small></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  {
    label: 'Emergency SOS',
    title: 'Reach safety in one tap',
    lead: 'When seconds count, a single press alerts everyone you trust with your location and a timestamp.',
    screen: <SosScreen />,
    callout: <div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutSosButton}`}><span className={styles.calloutLine} /><strong>Send SOS button</strong><small>Alerts trusted contacts in chat</small></div>,
    items: [['Trusted contacts', 'Notified in real time.'], ['Location control', 'Shared only when you choose.'], ['Panic exit', 'Hide the private app instantly.']],
    flip: false,
  },
  {
    label: 'Support & Community',
    title: 'You are never alone',
    lead: 'Talk to a trauma-informed advocate, then connect anonymously only with accepted friends.',
    screen: <ChatScreen />,
    callout: <div className={`${styles.callout} ${styles.calloutChatList}`}><span className={styles.calloutLine} /><strong>SafeBot + friend chats</strong><small>Message accepted friends only</small></div>,
    items: [['AI advocate', 'Safety planning at any hour.'], ['Accepted friends', 'Messages stay controlled.'], ['Quiet interface', 'Built for repeated use.']],
    flip: true,
  },
  {
    label: 'Resources Nearby',
    title: 'Find help close to home',
    lead: 'Discover shelters, legal aid, financial help, and counseling near you with clear next actions.',
    screen: <AidScreen />,
    callout: <div className={`${styles.callout} ${styles.calloutAidFilters}`}><span className={styles.calloutLine} /><strong>Filter nearby resources</strong><small>Shelter, legal, financial, counseling</small></div>,
    items: [['Local results', 'Sorted around your location.'], ['Real organizations', 'Shelters, legal aid, and counseling.'], ['Context-aware', 'Searches are not stored on-device.']],
    flip: false,
  },
];

export function HowItWorks() {
  const steps = [
    {
      title: 'Choose a cover',
      copy: 'Open through a working calculator, news, or weather screen. Each cover keeps SafeHaven hidden in plain sight.',
      screen: <CalculatorScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutCoverDot}`}>
          <span className={styles.calloutLine} />
          <strong>Discreet entry point</strong>
          <small>Small orange dot opens private mode</small>
        </div>
      ),
    },
    {
      title: 'Your private space opens',
      copy: 'A quiet home base brings SOS, chat, journaling, and resources together with the same warm app interface.',
      screen: <HomeScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutLocationToggle}`}>
          <span className={styles.calloutLine} />
          <strong>Live location control</strong>
          <small>Toggle sharing from safety setup</small>
        </div>
      ),
    },
    {
      title: 'Help is one tap away',
      copy: 'Send an SOS with your location, talk with an advocate, or find nearby resources without leaving context behind.',
      screen: <SosScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutShareToggle}`}>
          <span className={styles.calloutLine} />
          <strong>Share location with SOS</strong>
          <small>Contacts receive it only when sent</small>
        </div>
      ),
    },
  ];

  return (
    <section className={styles.section} id="how">
      <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
        <span className={styles.sectionLabel}>HOW IT WORKS</span>
        <h2>Hidden in plain sight.</h2>
        <p>SafeHaven lives behind everyday utility apps, then opens into a private safety space only you know how to reach.</p>
      </div>
      <div className={`${styles.steps} ${styles.desktopSteps}`}>
        {steps.map((step, index) => (
          <div className={`${styles.step} ${styles.reveal}`} data-reveal key={step.title}>
            <div className={styles.stepPhoneWrap}>
              <Phone callout={step.callout}>{step.screen}</Phone>
            </div>
            <span className={styles.stepNum}>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </div>
        ))}
      </div>
      <MobileSlideshow
        items={steps}
        renderItem={(step, index) => (
          <div className={styles.mobileSlide}>
            <Phone callout={step.callout}>{step.screen}</Phone>
            <span className={styles.stepNum}>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </div>
        )}
      />
    </section>
  );
}

export function Capabilities() {
  return (
    <section className={styles.section} id="capabilities">
      <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
        <span className={styles.sectionLabel}>WHAT&apos;S INSIDE</span>
        <h2>Everything you need, quietly.</h2>
        <p>Each tool mirrors the actual private app experience: fast, warm, and designed for stressful moments.</p>
      </div>
      <div className={`${styles.capabilities} ${styles.desktopCaps}`}>
        {CAPABILITIES.map((cap) => (
          <Capability key={cap.title} {...cap} />
        ))}
      </div>
      <MobileSlideshow
        items={CAPABILITIES}
        renderItem={(cap) => (
          <div className={styles.mobileSlide}>
            <Phone float callout={cap.callout}>{cap.screen}</Phone>
            <div className={styles.mobileCapText}>
              <span>{cap.label}</span>
              <h3>{cap.title}</h3>
              <p>{cap.lead}</p>
              <div className={styles.capList}>
                {cap.items.map(([itemTitle, copy]) => (
                  <div className={styles.capItem} key={itemTitle}>
                    <span>•</span>
                    <div><strong>{itemTitle}</strong><small>{copy}</small></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      />
    </section>
  );
}
