ALTER TABLE "Product"
ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE "Product"
SET "description" = regexp_replace(
  "description",
  '^Тестовий товар[[:space:]]*[—-][[:space:]]*',
  '',
  'i'
)
WHERE "description" ~* '^Тестовий товар';

UPDATE "Product"
SET "specifications" = CASE "sku"
  WHEN 'CPU-AMD-R5-7600' THEN '{"Сокет":"AM5","Ядра / потоки":"6 / 12","Базова частота":"3.8 GHz","Максимальна частота":"5.1 GHz"}'::jsonb
  WHEN 'GPU-RTX-4060' THEN '{"Відеопамʼять":"8 GB GDDR6","Інтерфейс":"PCI Express 4.0"}'::jsonb
  WHEN 'RAM-KF-32GB' THEN '{"Обсяг":"32 GB","Тип памʼяті":"DDR5"}'::jsonb
  WHEN 'SSD-WD-SN770-1TB' THEN '{"Обсяг":"1 TB","Форм-фактор":"M.2 2280","Інтерфейс":"PCIe Gen 4.0 x4"}'::jsonb
  ELSE "specifications"
END
WHERE "sku" IN ('CPU-AMD-R5-7600', 'GPU-RTX-4060', 'RAM-KF-32GB', 'SSD-WD-SN770-1TB')
  AND "specifications" = '{}'::jsonb;
