import 'package:flutter/material.dart';

class NoticesScreen extends StatelessWidget {
  const NoticesScreen({super.key});

  final List<Map<String, dynamic>> sampleNotices = const [
    {
      'title': 'દ્વિતીય સત્ર એકમ કસોટી (Unit Test 2) કાર્યક્રમ જાહેર',
      'category': 'EXAM',
      'date': 'આજે, ૧૧:૩૦ AM',
      'body': 'ધોરણ ૫ થી ૮ ના તમામ વિદ્યાર્થીઓ માટે આગામી સોમવારથી દ્વિતીય સત્ર એકમ કસોટી શરૂ થશે. વિગતવાર ટાઈમટેબલ નોટિસ બોર્ડ પર મુકેલ છે.',
      'priority': 'HIGH',
    },
    {
      'title': 'શિક્ષણ ફી ભરવા અંગે નમ્ર અપીલ (Fee Reminder)',
      'category': 'FEE',
      'date': 'ગઈકાલે',
      'body': 'દ્વિતીય સત્રની ફી ભરવાની અંતિમ તારીખ ૩૦ નવેમ્બર છે. વાલીઓએ શાળા કાર્યાલયમાં સમયસર ફી જમા કરાવવા વિનંતી.',
      'priority': 'NORMAL',
    },
    {
      'title': 'વાર્ષિક રમતોત્સવ અને સાંસ્કૃતિક કાર્યક્રમ આયોજન',
      'category': 'EVENT',
      'date': '૩ દિવસ પહેલા',
      'body': 'શાળાના વાર્ષિક રમતગમત સપ્તાહનું આયોજન આવતા મહિને કરવામાં આવશે. ભાગ લેવા ઇચ્છતા વિદ્યાર્થીઓએ પીટી શિક્ષકશ્રીને નામ નોંધાવવા.',
      'priority': 'NORMAL',
    },
    {
      'title': 'સ્વચ્છતા પખવાડિયું અને વૃક્ષારોપણ ઝુંબેશ',
      'category': 'GENERAL',
      'date': '૫ દિવસ પહેલા',
      'body': 'શાળા પ્રાંગણમાં ઇકો ક્લબ અંતર્ગત વૃક્ષારોપણ અને સ્વચ્છતા અભિયાન સફળતાપૂર્વક પૂર્ણ થયેલ છે.',
      'priority': 'NORMAL',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFEA580C),
        title: const Text('શાળા સૂચનાઓ અને પરિપત્રો (Notices)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: sampleNotices.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final notice = sampleNotices[index];
          final isHigh = notice['priority'] == 'HIGH';

          Color tagColor;
          if (notice['category'] == 'EXAM') {
            tagColor = Colors.purple;
          } else if (notice['category'] == 'FEE') {
            tagColor = Colors.red;
          } else if (notice['category'] == 'EVENT') {
            tagColor = Colors.green;
          } else {
            tagColor = Colors.blue;
          }

          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isHigh ? Colors.red.shade200 : Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: tagColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        notice['category'],
                        style: TextStyle(color: tagColor, fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                    ),
                    Text(
                      notice['date'],
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  notice['title'],
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 6),
                Text(
                  notice['body'],
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.4),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
