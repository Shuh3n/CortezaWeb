import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Team = () => {
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: 'Carolina Londoño Idárraga',
      role: t('about.team.roles.presidenta'),
      image: '/images/carolina-londono-idarraga.jpg',
      color: 'from-primary/20 to-primary/5'
    },
    {
      name: 'Yesenia Liévano Güiza',
      role: t('about.team.roles.tesorera'),
      image: '/images/yesenia-lievano-guiza.jpg',
      color: 'from-secondary/20 to-secondary/5'
    },
    {
      name: 'Laura Viviana Jiménez',
      role: t('about.team.roles.secretaria'),
      image: '/images/laura-viviana-jimenez.jpg',
      color: 'from-accent/20 to-accent/5'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
      <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative py-16 md:py-20 px-4 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/5 overflow-hidden"
      >
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
        />
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.2 }}
            className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
        />
        <div className="w-[70%] mx-auto relative z-10">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-4">
              {t('about.team.titulo')}
            </h2>
            <p className="text-text-muted text-lg">
              {t('about.team.descripcion')}
            </p>
          </motion.div>

          <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-3 gap-8"
          >
            {teamMembers.map((member) => (
                <motion.div
                    key={member.name}
                    variants={itemVariants}
                    whileHover={{ y: -12 }}
                    className="group relative"
                >
                  <div className="relative bg-white rounded-[48px] overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 group-hover:shadow-primary/20">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <motion.div
                          className="inline-block px-4 py-1 bg-accent/20 backdrop-blur-md rounded-full text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-accent/30"
                      >
                        {member.role.split(' ')[0]}
                      </motion.div>
                      <h3 className="text-2xl font-black text-white mb-1 leading-tight tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-white/70 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {member.role}
                      </p>
                    </div>

                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-12 group-hover:rotate-0">
                      <span className="text-white text-xl">🌿</span>
                    </div>
                  </div>

                  <div className="absolute -inset-2 bg-primary/5 rounded-[54px] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
  );
};

export default Team;