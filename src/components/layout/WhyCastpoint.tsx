// components/WhyCastpoint.tsx
import Image from "next/image";
import styles from "../../styles/WhyCastpoint.module.scss";

const features = [
  {
    icon: "/images/icons/briefcase.svg",
    text: "Find and apply for job opportunities",
  },
  {
    icon: "/images/icons/review.svg",
    text: "Share reviews about employers and venues",
  },
  {
    icon: "/images/icons/review1.svg",
    text: "Connect with fellow artists worldwide",
  },
  {
    icon: "/images/icons/comment.svg",
    text: "Get insider tips and real-life hacks for working and living abroad",
  },
];

export default function WhyCastpoint() {
  return (
    <section className={`${styles.main} w-full bg-white py-16 px-4 sm:px-10 lg:px-24 overflow-hidden relative`}>
      <div className={`${styles.main_icons} relative z-10`}>
        {features.map(({ icon, text }, index) => (
          <div key={index} className={`${styles.main_icons_icon} relative flex flex-col items-center w-full`}>
            {/* Іконка поверх */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 bg-white p-3 rounded-full border border-orange-200 shadow-md">
              <Image src={icon} alt="" width={55} height={65} className={styles.main_icons_icon_img} />
            </div>


            {/* Фонова підкладка (substract) */}
            <div className="relative flex items-center justify-items-center">
              <img src="/images/icons/figures/subtract.svg" alt="" className="w-full z-0" />

              {/* Текст */}
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[5%] px-4 text-m  text-black text-center z-10 w-full">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
