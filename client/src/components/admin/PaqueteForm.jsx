import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';
import slugify from '../../utils/slugify';
import styles from './PaqueteForm.module.css';

const MONEDAS = [
  { value: 'USD', label: 'USD (Dolar)' },
  { value: 'UYU', label: 'UYU (Peso uruguayo)' },
  { value: 'EUR', label: 'EUR (Euro)' },
];

export default function PaqueteForm({
  defaultValues,
  etiquetas = [],
  destinos = [],
  onSubmit,
  guardando = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      titulo: '',
      slug: '',
      descripcion: '',
      resumen: '',
      precio_adulto: '',
      precio_nino: '',
      precio_infante: '',
      moneda: 'USD',
      duracion_dias: '',
      duracion_noches: '',
      condiciones: '',
      disponible: true,
      destacado: false,
      etiquetas_ids: [],
      destinos_ids: [],
      ...defaultValues,
    },
  });

  /* ── Dynamic lists for incluye / no_incluye ── */
  const [incluye, setIncluye] = useState(defaultValues?.incluye || []);
  const [noIncluye, setNoIncluye] = useState(defaultValues?.no_incluye || []);
  const [nuevoIncluye, setNuevoIncluye] = useState('');
  const [nuevoNoIncluye, setNuevoNoIncluye] = useState('');

  /* ── Auto-slug from title ── */
  const [slugManual, setSlugManual] = useState(false);
  const titulo = watch('titulo');

  useEffect(() => {
    if (!slugManual && titulo) {
      setValue('slug', slugify(titulo));
    }
  }, [titulo, slugManual, setValue]);

  /* ── Handlers for dynamic lists ── */
  const agregarIncluye = useCallback(() => {
    const texto = nuevoIncluye.trim();
    if (!texto) return;
    setIncluye((prev) => [...prev, texto]);
    setNuevoIncluye('');
  }, [nuevoIncluye]);

  const eliminarIncluye = (index) => {
    setIncluye((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarNoIncluye = useCallback(() => {
    const texto = nuevoNoIncluye.trim();
    if (!texto) return;
    setNoIncluye((prev) => [...prev, texto]);
    setNuevoNoIncluye('');
  }, [nuevoNoIncluye]);

  const eliminarNoIncluye = (index) => {
    setNoIncluye((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, agregar) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregar();
    }
  };

  /* ── Submit ── */
  const procesarSubmit = (data) => {
    const payload = {
      ...data,
      precio_adulto: data.precio_adulto ? Number(data.precio_adulto) : null,
      precio_nino: data.precio_nino ? Number(data.precio_nino) : null,
      precio_infante: data.precio_infante ? Number(data.precio_infante) : null,
      duracion_dias: data.duracion_dias ? Number(data.duracion_dias) : null,
      duracion_noches: data.duracion_noches ? Number(data.duracion_noches) : null,
      incluye,
      no_incluye: noIncluye,
    };
    onSubmit?.(payload);
  };

  return (
    <form
      className={styles.formulario}
      onSubmit={handleSubmit(procesarSubmit)}
      noValidate
    >
      {/* ══════════ Seccion 1: Info basica ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Informacion basica</legend>

        <div className={styles.filaDos}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="titulo">Titulo *</label>
            <input
              id="titulo"
              type="text"
              className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
              {...register('titulo', { required: 'El titulo es obligatorio' })}
              placeholder="Nombre del paquete"
            />
            {errors.titulo && <span className={styles.errorMsg}>{errors.titulo.message}</span>}
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="slug">Slug *</label>
            <input
              id="slug"
              type="text"
              className={`${styles.input} ${errors.slug ? styles.inputError : ''}`}
              {...register('slug', { required: 'El slug es obligatorio' })}
              placeholder="url-del-paquete"
              onChange={(e) => {
                setSlugManual(true);
                setValue('slug', e.target.value);
              }}
            />
            {errors.slug && <span className={styles.errorMsg}>{errors.slug.message}</span>}
          </div>
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="resumen">Resumen</label>
          <textarea
            id="resumen"
            className={styles.textarea}
            {...register('resumen', { maxLength: { value: 500, message: 'Maximo 500 caracteres' } })}
            placeholder="Breve resumen del paquete (max 500 caracteres)"
            rows={2}
          />
          {errors.resumen && <span className={styles.errorMsg}>{errors.resumen.message}</span>}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="descripcion">Descripcion</label>
          <textarea
            id="descripcion"
            className={styles.textarea}
            {...register('descripcion')}
            placeholder="Descripcion completa del paquete"
            rows={5}
          />
        </div>
      </fieldset>

      {/* ══════════ Seccion 2: Precios ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Precios</legend>

        <div className={styles.filaCuatro}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_adulto">Precio adulto *</label>
            <input
              id="precio_adulto"
              type="number"
              step="0.01"
              min="0"
              className={`${styles.input} ${errors.precio_adulto ? styles.inputError : ''}`}
              {...register('precio_adulto', { required: 'Obligatorio' })}
              placeholder="0.00"
            />
            {errors.precio_adulto && <span className={styles.errorMsg}>{errors.precio_adulto.message}</span>}
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_nino">Precio nino</label>
            <input
              id="precio_nino"
              type="number"
              step="0.01"
              min="0"
              className={styles.input}
              {...register('precio_nino')}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_infante">Precio infante</label>
            <input
              id="precio_infante"
              type="number"
              step="0.01"
              min="0"
              className={styles.input}
              {...register('precio_infante')}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="moneda">Moneda</label>
            <select
              id="moneda"
              className={styles.select}
              {...register('moneda')}
            >
              {MONEDAS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ══════════ Seccion 3: Duracion ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Duracion</legend>

        <div className={styles.filaDos}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="duracion_dias">Dias</label>
            <input
              id="duracion_dias"
              type="number"
              min="1"
              className={styles.input}
              {...register('duracion_dias')}
              placeholder="Ej: 7"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="duracion_noches">Noches</label>
            <input
              id="duracion_noches"
              type="number"
              min="0"
              className={styles.input}
              {...register('duracion_noches')}
              placeholder="Ej: 6"
            />
          </div>
        </div>
      </fieldset>

      {/* ══════════ Seccion 4: Incluye / No incluye ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Incluye / No incluye</legend>

        <div className={styles.filaDos}>
          {/* Incluye */}
          <div className={styles.campo}>
            <label className={styles.label}>Incluye</label>
            <div className={styles.listaItems}>
              {incluye.map((item, i) => (
                <div key={i} className={styles.itemChip}>
                  <span className={styles.itemTexto}>{item}</span>
                  <button
                    type="button"
                    className={styles.itemEliminar}
                    onClick={() => eliminarIncluye(i)}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.agregarWrap}>
              <input
                type="text"
                className={styles.input}
                value={nuevoIncluye}
                onChange={(e) => setNuevoIncluye(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, agregarIncluye)}
                placeholder="Ej: Desayuno incluido"
              />
              <button
                type="button"
                className={styles.botonAgregarItem}
                onClick={agregarIncluye}
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          {/* No incluye */}
          <div className={styles.campo}>
            <label className={styles.label}>No incluye</label>
            <div className={styles.listaItems}>
              {noIncluye.map((item, i) => (
                <div key={i} className={`${styles.itemChip} ${styles.itemChipRojo}`}>
                  <span className={styles.itemTexto}>{item}</span>
                  <button
                    type="button"
                    className={styles.itemEliminar}
                    onClick={() => eliminarNoIncluye(i)}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.agregarWrap}>
              <input
                type="text"
                className={styles.input}
                value={nuevoNoIncluye}
                onChange={(e) => setNuevoNoIncluye(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, agregarNoIncluye)}
                placeholder="Ej: Vuelos internacionales"
              />
              <button
                type="button"
                className={styles.botonAgregarItem}
                onClick={agregarNoIncluye}
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      {/* ══════════ Seccion 5: Condiciones ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Condiciones</legend>

        <div className={styles.campo}>
          <textarea
            id="condiciones"
            className={styles.textarea}
            {...register('condiciones')}
            placeholder="Condiciones generales del paquete, politicas de cancelacion, etc."
            rows={4}
          />
        </div>
      </fieldset>

      {/* ══════════ Seccion 6: Etiquetas ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Etiquetas</legend>

        <Controller
          name="etiquetas_ids"
          control={control}
          render={({ field }) => (
            <div className={styles.checkboxGrid}>
              {etiquetas.map((categoria) => (
                <div key={categoria.id} className={styles.categoriaGrupo}>
                  <span className={styles.categoriaLabel}>{categoria.nombre}</span>
                  <div className={styles.checkboxLista}>
                    {categoria.etiquetas.map((etiqueta) => {
                      const checked = (field.value || []).includes(etiqueta.id);
                      return (
                        <label key={etiqueta.id} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={checked}
                            onChange={(e) => {
                              const ids = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...ids, etiqueta.id]);
                              } else {
                                field.onChange(ids.filter((id) => id !== etiqueta.id));
                              }
                            }}
                          />
                          <span className={styles.checkboxTexto}>{etiqueta.nombre}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {etiquetas.length === 0 && (
                <p className={styles.sinDatos}>No hay etiquetas disponibles.</p>
              )}
            </div>
          )}
        />
      </fieldset>

      {/* ══════════ Seccion 7: Destinos ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Destinos</legend>

        <Controller
          name="destinos_ids"
          control={control}
          render={({ field }) => (
            <div className={styles.checkboxLista}>
              {destinos.map((destino) => {
                const checked = (field.value || []).includes(destino.id);
                return (
                  <label key={destino.id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checked}
                      onChange={(e) => {
                        const ids = field.value || [];
                        if (e.target.checked) {
                          field.onChange([...ids, destino.id]);
                        } else {
                          field.onChange(ids.filter((id) => id !== destino.id));
                        }
                      }}
                    />
                    <span className={styles.checkboxTexto}>
                      {destino.nombre}
                      {destino.pais && <span className={styles.checkboxMeta}> ({destino.pais})</span>}
                    </span>
                  </label>
                );
              })}
              {destinos.length === 0 && (
                <p className={styles.sinDatos}>No hay destinos disponibles.</p>
              )}
            </div>
          )}
        />
      </fieldset>

      {/* ══════════ Seccion 8: Opciones ══════════ */}
      <fieldset className={styles.seccion}>
        <legend className={styles.seccionTitulo}>Opciones</legend>

        <div className={styles.togglesWrap}>
          <label className={styles.toggleItem}>
            <span className={styles.toggleLabel}>Disponible</span>
            <span className={styles.toggleDesc}>El paquete sera visible en el sitio publico</span>
            <Controller
              name="disponible"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  className={`${styles.toggle} ${field.value ? styles.toggleActivo : ''}`}
                  onClick={() => field.onChange(!field.value)}
                >
                  <span className={styles.toggleCircle} />
                </button>
              )}
            />
          </label>

          <label className={styles.toggleItem}>
            <span className={styles.toggleLabel}>Destacado</span>
            <span className={styles.toggleDesc}>Aparecera en la seccion de destacados de la home</span>
            <Controller
              name="destacado"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  className={`${styles.toggle} ${field.value ? styles.toggleActivo : ''}`}
                  onClick={() => field.onChange(!field.value)}
                >
                  <span className={styles.toggleCircle} />
                </button>
              )}
            />
          </label>
        </div>
      </fieldset>

      {/* ══════════ Boton guardar ══════════ */}
      <div className={styles.acciones}>
        <button
          type="submit"
          className={styles.botonGuardar}
          disabled={guardando}
        >
          <FiSave size={16} />
          {guardando ? 'Guardando...' : 'Guardar paquete'}
        </button>
      </div>
    </form>
  );
}
