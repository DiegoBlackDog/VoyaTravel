import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { urlImagen } from '../../services/paqueteService';
import styles from './PaqueteGaleria.module.css';

export default function PaqueteGaleria({ imagenes = [], titulo = '' }) {
  if (!imagenes.length) {
    return (
      <div className={styles.placeholder}>
        <span>Sin imágenes disponibles</span>
      </div>
    );
  }

  return (
    <div className={styles.galeriaWrapper}>
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        loop={imagenes.length > 1}
        className={styles.swiper}
      >
        {imagenes.map((img) => (
          <SwiperSlide key={img.id} className={styles.slide}>
            <img
              src={urlImagen(img.url)}
              alt={`${titulo} - imagen ${img.orden}`}
              className={styles.imagen}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder-paquete.jpg';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
