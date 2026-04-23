'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const fmtDate = (d?: string | Date | null) => {
  if (!d) return '';
  const date = new Date(d);
  return isNaN(date.getTime())
    ? String(d)
    : date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
};

const finishLabel = (f?: string) =>
  f === 'GLOSS' ? 'Глянец' : f === 'MATTE' ? 'Матовый' : '';

const holeLabel = (p?: string) => {
  if (p === 'TWO_HORIZONTAL') return '2шт горизонтально';
  if (p === 'TWO_VERTICAL') return '2шт вертикально';
  if (p === 'FOUR_CORNERS') return '4шт по углам';
  return '';
};

type BlankData = {
  number?: string | number;
  customerName?: string;
  customerPhone?: string;
  dateAccepted?: string;
  dateDelivery?: string;
  organization?: string;
  intakePoint?: string;
  deliveryInfo?: string;
  approveNeeded?: boolean;
  goldType?: string;
  comment?: string;
  label?: string;
  material?: string;
  size?: string;
  finish?: string;
  background?: string;
  frame?: string | number;
  holePattern?: string;
  hasHoles?: boolean;
  deceased: {
    lastName?: string;
    firstName?: string;
    middleName?: string;
    birthDate?: string;
    deathDate?: string;
    secondLastName?: string;
    secondFirstName?: string;
    secondMiddleName?: string;
    secondBirthDate?: string;
    secondDeathDate?: string;
  };
  assetUrl?: string | null;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 30,
    color: '#000',
  },

  headerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  headerBorder: { borderTopWidth: 3, borderTopColor: '#000', marginBottom: 8 },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dates: { fontSize: 11 },
  dateLine: { marginBottom: 4 },
  approveRow: { flexDirection: 'row', alignItems: 'center' },
  approveText: { textDecoration: 'underline', fontSize: 11, marginRight: 8 },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 11, lineHeight: 1 },

  infoLine: { marginBottom: 3, fontSize: 11 },
  infoLabel: { fontWeight: 'bold' },

  table: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    backgroundColor: '#ebf1dd',
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    padding: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 6,
    fontSize: 10,
    minHeight: 28,
    justifyContent: 'center',
    textAlign: 'center',
  },
  tableCellLast: { borderRightWidth: 0 },

  colCermet: { width: '20%' },
  colGranite: { width: '17%' },
  colGlass: { width: '13%' },
  colEngrave: { width: '15%' },
  colFrame: { width: '10%' },
  colBack: { width: '12%' },
  colSize: { width: '13%' },

  commentHolesRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  commentCell: {
    width: '65%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 8,
    minHeight: 50,
  },
  commentLabel: { textDecoration: 'underline', fontSize: 11 },
  holesCell: {
    width: '35%',
    padding: 8,
  },

  personRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    minHeight: 26,
  },
  personLabelCell: {
    width: '22%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  personValueCell: {
    width: '39%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    fontSize: 10,
    justifyContent: 'center',
  },
  personValueCellLast: {
    width: '39%',
    padding: 5,
    fontSize: 10,
    justifyContent: 'center',
  },

  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  signatureLabel: { fontSize: 11, marginRight: 8 },
  signatureLine: {
    width: 220,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    height: 14,
  },

  photoWrap: { marginTop: 20, alignItems: 'flex-start' },
  photo: { width: 180, height: 240, objectFit: 'cover' },
  photoPlaceholder: {
    width: 180,
    height: 240,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
  },
});

const Checkbox = ({ checked }: { checked: boolean }) => (
  <View style={styles.checkbox}>
    {checked && <Text style={styles.checkMark}>✓</Text>}
  </View>
);

export function OrderBlankPdf({ data }: { data: BlankData }) {
  const d = data.deceased;
  const hasSecond = Boolean(
    d.secondLastName || d.secondFirstName || d.secondBirthDate,
  );

  const material = data.material;
  const finish = finishLabel(data.finish);
  const labelWithFinish = finish
    ? `${data.label ?? ''} ${finish}`
    : (data.label ?? '');

  const cermetText =
    material === 'CERMET'
      ? data.goldType
        ? `${data.goldType.toUpperCase()} золото`
        : (data.label ?? '')
      : '';
  const graniteText =
    material === 'WHITE_CERAMIC_GRANITE' ||
    material === 'BLACK_CERAMIC_GRANITE' ||
    material === 'GROWTH_PHOTOCERAMICS'
      ? labelWithFinish
      : '';
  const glassText = material === 'GLASS' ? (data.label ?? '') : '';
  const engraveText = material === 'ENGRAVING' ? (data.label ?? '') : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerTitle}>
          БЛАНК ЗАКАЗА № {data.number ?? ''}
        </Text>
        <View style={styles.headerBorder} />

        <View style={styles.topRow}>
          <View style={styles.dates}>
            <Text style={styles.dateLine}>
              Дата приема: {fmtDate(data.dateAccepted)}
            </Text>
            <Text style={styles.dateLine}>
              Дата выдачи: {fmtDate(data.dateDelivery)}
            </Text>
          </View>
          <View style={styles.approveRow}>
            <Text style={styles.approveText}>Согласование:</Text>
            <Text>да</Text>
            <Checkbox checked={!!data.approveNeeded} />
            <Text>нет</Text>
            <Checkbox checked={!data.approveNeeded} />
          </View>
        </View>

        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Организация: </Text>
          {data.organization || ''}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Пункт приема: </Text>
          {data.intakePoint || ''}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Заказчик: </Text>
          {[data.customerName, data.customerPhone].filter(Boolean).join(' ')}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Доставка: </Text>
          {data.deliveryInfo || ''}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, styles.colCermet]}>
              Металлокерамика
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colGranite]}>
              Керамогранит
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colGlass]}>
              Стекло
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colEngrave]}>
              Гравировка
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colFrame]}>Рамка</Text>
            <Text style={[styles.tableHeaderCell, styles.colBack]}>Фон</Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.colSize,
                styles.tableCellLast,
              ]}
            >
              Размер
            </Text>
          </View>

          {/* Values */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.colCermet]}>
              <Text>{cermetText}</Text>
            </View>
            <View style={[styles.tableCell, styles.colGranite]}>
              <Text>{graniteText}</Text>
            </View>
            <View style={[styles.tableCell, styles.colGlass]}>
              <Text>{glassText}</Text>
            </View>
            <View style={[styles.tableCell, styles.colEngrave]}>
              <Text>{engraveText}</Text>
            </View>
            <View style={[styles.tableCell, styles.colFrame]}>
              <Text>{data.frame ?? ''}</Text>
            </View>
            <View style={[styles.tableCell, styles.colBack]}>
              <Text>{data.background ?? ''}</Text>
            </View>
            <View
              style={[styles.tableCell, styles.colSize, styles.tableCellLast]}
            >
              <Text>{data.size ?? ''}</Text>
            </View>
          </View>

          <View style={styles.commentHolesRow}>
            <View style={styles.commentCell}>
              <Text style={styles.commentLabel}>Комментарий:</Text>
              <Text style={{ marginTop: 4 }}>{data.comment || ''}</Text>
            </View>
            <View style={styles.holesCell}>
              <View style={styles.approveRow}>
                <Text style={styles.approveText}>Отверстия:</Text>
                <Text>да</Text>
                <Checkbox checked={!!data.hasHoles} />
                <Text>нет</Text>
                <Checkbox checked={!data.hasHoles} />
              </View>
              {data.hasHoles && (
                <Text style={{ marginTop: 6, textAlign: 'right' }}>
                  {holeLabel(data.holePattern)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.personRow}>
            <View style={styles.personLabelCell}>
              <Text>Фамилия</Text>
            </View>
            <View style={styles.personValueCell}>
              <Text>{d.lastName || ''}</Text>
            </View>
            <View style={styles.personValueCellLast}>
              <Text>{hasSecond ? d.secondLastName || '' : ''}</Text>
            </View>
          </View>
          <View style={styles.personRow}>
            <View style={styles.personLabelCell}>
              <Text>Имя</Text>
            </View>
            <View style={styles.personValueCell}>
              <Text>{d.firstName || ''}</Text>
            </View>
            <View style={styles.personValueCellLast}>
              <Text>{hasSecond ? d.secondFirstName || '' : ''}</Text>
            </View>
          </View>
          <View style={styles.personRow}>
            <View style={styles.personLabelCell}>
              <Text>Отчество</Text>
            </View>
            <View style={styles.personValueCell}>
              <Text>{d.middleName || ''}</Text>
            </View>
            <View style={styles.personValueCellLast}>
              <Text>{hasSecond ? d.secondMiddleName || '' : ''}</Text>
            </View>
          </View>
          <View style={styles.personRow}>
            <View style={styles.personLabelCell}>
              <Text>Дата рождения</Text>
            </View>
            <View style={styles.personValueCell}>
              <Text>{fmtDate(d.birthDate)}</Text>
            </View>
            <View style={styles.personValueCellLast}>
              <Text>{hasSecond ? fmtDate(d.secondBirthDate) : ''}</Text>
            </View>
          </View>
          <View style={styles.personRow}>
            <View style={styles.personLabelCell}>
              <Text>Дата смерти</Text>
            </View>
            <View style={styles.personValueCell}>
              <Text>{fmtDate(d.deathDate)}</Text>
            </View>
            <View style={styles.personValueCellLast}>
              <Text>{hasSecond ? fmtDate(d.secondDeathDate) : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Подпись заказчика</Text>
          <View style={styles.signatureLine} />
        </View>

        <View style={styles.photoWrap}>
          {data.assetUrl ? (
            <Image src={data.assetUrl} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text>Без фото</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
