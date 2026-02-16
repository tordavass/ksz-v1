import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register Roboto from CDN for full CE support
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto', // Use the registered font
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  meta: {
    fontSize: 10,
    color: 'grey',
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeaderName: {
    width: '70%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableColHeaderHours: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableColName: {
    width: '70%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColHours: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

interface StudentSummary {
  id: string;
  full_name: string | null;
  total_hours: number;
}

interface ClassSummaryDocumentProps {
  className: string;
  students: StudentSummary[];
  generatedAt: string;
}

const ClassSummaryDocument: React.FC<ClassSummaryDocumentProps> = ({ className, students, generatedAt }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Iskolai Közösségi Szolgálat</Text>
        <Text style={styles.subtitle}>Osztály Összesítő - {className}</Text>
        <Text style={styles.meta}>Generálva: {generatedAt}</Text>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={{ ...styles.tableColHeaderName, width: '25%' }}>
            <Text style={styles.tableCellHeader}>Tanuló Neve</Text>
          </View>
          <View style={{ ...styles.tableColHeaderHours, width: '15%' }}>
            <Text style={styles.tableCellHeader}>Eddigi Órák</Text>
          </View>
          <View style={{ ...styles.tableColHeaderHours, width: '15%', backgroundColor: '#fff' }}>
            <Text style={styles.tableCellHeader}>Dátum</Text>
          </View>
          <View style={{ ...styles.tableColHeaderHours, width: '30%', backgroundColor: '#fff' }}>
            <Text style={styles.tableCellHeader}>Tevékenység</Text>
          </View>
          <View style={{ ...styles.tableColHeaderHours, width: '15%', backgroundColor: '#fff' }}>
            <Text style={styles.tableCellHeader}>Aláírás</Text>
          </View>
        </View>

        {/* Table Rows */}
        {students.map((student) => (
          <View style={styles.tableRow} key={student.id}>
            <View style={{ ...styles.tableColName, width: '25%' }}>
              <Text style={styles.tableCell}>{student.full_name || 'Névtelen'}</Text>
            </View>
            <View style={{ ...styles.tableColHours, width: '15%' }}>
              <Text style={styles.tableCell}>{student.total_hours}</Text>
            </View>
            {/* Empty Columns for Manual Logging */}
            <View style={{ ...styles.tableColHours, width: '15%', borderBottomWidth: 1 }}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={{ ...styles.tableColHours, width: '30%', borderBottomWidth: 1 }}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={{ ...styles.tableColHours, width: '15%', borderBottomWidth: 1 }}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        ))}
        {/* Add minimal footer note about offline usage */}
      </View>
      <Text style={{ fontSize: 9, color: 'grey', marginTop: 10, fontStyle: 'italic' }}>
        *A fenti táblázat rendszerhiba esetén jelenléti ívként használható a manuális naplózáshoz.
      </Text>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `Oldal ${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default ClassSummaryDocument;
