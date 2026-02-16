import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register a font that supports Hungarian characters (Latin-Extended)
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' }
    ]
})

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Roboto', // Use the registered font
        fontSize: 12,
        lineHeight: 1.5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        padding: 5,
    },
    text: {
        marginBottom: 10,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 150,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        borderTopWidth: 1,
        borderColor: '#000',
        paddingTop: 10,
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        fontSize: 10,
        textAlign: 'center',
        color: 'gray',
    }
})

interface ContractProps {
    studentName: string
    studentClass?: string
    companyName: string
    companyAddress?: string
    ownerName: string
    date: string
    isSignedByOwner: boolean
    isSignedByPrincipal: boolean
}

export const ContractDocument = ({
    studentName,
    studentClass,
    companyName,
    companyAddress,
    ownerName,
    date,
    isSignedByOwner,
    isSignedByPrincipal
}: ContractProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>EGYÜTTMŰKÖDÉSI MEGÁLLAPODÁS</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#444', fontSize: 10 }}>
                az iskolai közösségi szolgálat teljesítéséről
            </Text>

            <View style={{ marginBottom: 15 }}>
                <Text style={styles.text}>
                    amely létrejött egyrészről a(z) <Text style={styles.bold}> Óbudai Gimnázium </Text> (Székhely: Budapest, Szentlélek tér 10), képviseli: <Text style={styles.bold}> Szűcs József </Text> (a továbbiakban: Iskola),
                </Text>
                <Text style={styles.text}>
                    másrészről a(z) <Text style={styles.bold}> {companyName} </Text> (Székhely: {companyAddress || '__________________'}), képviseli: <Text style={styles.bold}> {ownerName} </Text> (a továbbiakban: Fogadó Szervezet),
                </Text>
                <Text style={styles.text}>
                    harmadrészről <Text style={styles.bold}> {studentName} </Text> {studentClass ? `(${studentClass} osztályos tanuló)` : ''} (a továbbiakban: Önkéntes) között, az alábbi feltételekkel:
                </Text>
            </View>

            <Text style={styles.text}>
                1. A megállapodás tárgya az Iskola tanulója által a középiskolai tanulmányok során teljesítendő 50 órás közösségi szolgálat lebonyolítása, a nemzeti köznevelésről szóló 2011. évi CXC. törvény, valamint a 20/2012. (VIII. 31.) EMMI rendelet alapján.
            </Text>

            <Text style={styles.subtitle}>2. A Fogadó Szervezet vállalásai</Text>
            <Text style={styles.text}>
                - Foglalkoztatja a tanulót a közösségi szolgálat keretében, biztosítva a tevékenységhez szükséges feltételeket.{"\n"}
                - Kijelöl egy mentort, aki szakmailag irányítja és felügyeli a tanuló tevékenységét.{"\n"}
                - Megtartja a szükséges munkavédelmi és tűzvédelmi oktatást a tevékenység megkezdése előtt.{"\n"}
                - A tanuló által vezetett Közösségi Szolgálati Naplóban aláírásával igazolja a teljesített órákat.{"\n"}
                - Értesíti az Iskolát, ha a tanuló kötelezettségeit nem teljesíti vagy a házirendet megsérti.
            </Text>

            <Text style={styles.subtitle}>3. Az Iskola vállalásai</Text>
            <Text style={styles.text}>
                - Megszervezi a tanulók felkészítését és pedagógiai feldolgozását.{"\n"}
                - Kapcsolatot tart a Fogadó Szervezettel a koordinátor útján.{"\n"}
                - A Fogadó Szervezet igazolása alapján adminisztrálja a teljesített órákat a tanuló törzslapjában és bizonyítványában.
            </Text>

            <Text style={styles.subtitle}>4. Az Önkéntes (Tanuló) kötelezettségei</Text>
            <Text style={styles.text}>
                - A vállalt tevékenységet a Fogadó Szervezet házirendjét betartva, a mentor utasításai szerint végzi.{"\n"}
                - Rendszeresen vezeti a Közösségi Szolgálati Naplót, és azt minden alkalom után aláíratja a mentorral.{"\n"}
                - Betartja a munkavédelmi és tűzvédelmi előírásokat.
            </Text>

            <Text style={styles.subtitle}>5. Záró rendelkezések</Text>
            <Text style={styles.text}>
                Jelen megállapodás a felek aláírásának napján lép hatályba és a kötelező közösségi szolgálat teljesítéséig, de legfeljebb a tanulói jogviszony megszűnéséig érvényes. A Felek a megállapodást elolvasták, és azt, mint akaratukkal mindenben megegyezőt, jóváhagyólag írták alá.
            </Text>

            <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                    {isSignedByOwner ? (
                        <Text style={{ fontStyle: 'italic', fontSize: 14 }}>{ownerName}</Text>
                    ) : (
                        <Text style={{ color: '#ccc' }}>[Aláírásra vár]</Text>
                    )}
                    <Text style={{ marginTop: 5, fontSize: 10 }}>Fogadó Szervezet</Text>
                </View>

                <View style={styles.signatureBox}>
                    {isSignedByPrincipal ? (
                        <Text style={{ fontStyle: 'italic', fontSize: 14 }}>Igazgató</Text>
                    ) : (
                        <Text style={{ color: '#ccc' }}>[Aláírásra vár]</Text>
                    )}
                    <Text style={{ marginTop: 5, fontSize: 10 }}>Iskola Igazgatója</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Kelt: {new Date(date).toLocaleDateString('hu-HU')} • Generálva a KSZ Rendszer által
            </Text>
        </Page>
    </Document>
)
