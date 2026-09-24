import 'package:flutter/material.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  String selectedDay = 'સોમવાર (Monday)';

  final List<String> days = ['સોમવાર (Monday)', 'મંગળવાર (Tuesday)', 'બુધવાર (Wednesday)', 'ગુરુવાર (Thursday)', 'શુક્રવાર (Friday)', 'શનિવાર (Saturday)'];

  final List<Map<String, String>> schedule = [
    {'period': '૧', 'time': '૧૦:૩૦ - ૧૧:૧૫', 'subject': 'ગુજરાતી (Gujarati)', 'teacher': 'શ્રીમતી ગીતાબેન જોશી', 'room': 'રૂમ નં ૧૦૧'},
    {'period': '૨', 'time': '૧૧:૧૫ - ૧૨:૦૦', 'subject': 'ગણિત (Mathematics)', 'teacher': 'શ્રી હરેશભાઈ પટેલ', 'room': 'રૂમ નં ૧૦૧'},
    {'period': '૩', 'time': '૧૨:૦૦ - ૧૨:૪૫', 'subject': 'વિજ્ઞાન (Science)', 'teacher': 'શ્રી સંજયભાઈ ત્રિવેદી', 'room': 'વિજ્ઞાન પ્રયોગશાળા'},
    {'period': 'રિસેસ', 'time': '૧૨:૪૫ - ૦૧:૧૫', 'subject': 'મધ્યાહન ભોજન / રીસેસ (Recess)', 'teacher': '-', 'room': 'મેદાન'},
    {'period': '૪', 'time': '૦૧:૧૫ - ૦૨:૦૦', 'subject': 'સામાજિક વિજ્ઞાન (Social Science)', 'teacher': 'શ્રીમતી નીતાબેન પંડ્યા', 'room': 'રૂમ નં ૧૦૧'},
    {'period': '૫', 'time': '૦૨:૦૦ - ૦૨:૪૫', 'subject': 'અંગ્રેજી (English)', 'teacher': 'શ્રી પરેશભાઈ મહેતા', 'room': 'રૂમ નં ૧૦૧'},
    {'period': '૬', 'time': '૦૨:૪૫ - ૦૩:૩૦', 'subject': 'હિન્દી / સંસ્કૃત', 'teacher': 'શ્રી અશોકભાઈ ભટ્ટ', 'room': 'રૂમ નં ૧૦૧'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF007ED4),
        title: const Text('સમયપત્રક (Class Timetable)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Day selector horizontally scrollable
          Container(
            height: 50,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: days.length,
              itemBuilder: (context, index) {
                final day = days[index];
                final isSelected = day == selectedDay;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(day),
                    selected: isSelected,
                    selectedColor: const Color(0xFF007ED4),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.black87,
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => selectedDay = day);
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: schedule.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = schedule[index];
                final isRecess = item['period'] == 'રિસેસ';

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isRecess ? Colors.amber.shade50 : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isRecess ? Colors.amber.shade200 : Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isRecess ? Colors.amber.shade700 : const Color(0xFF007ED4).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          item['period']!,
                          style: TextStyle(
                            color: isRecess ? Colors.white : const Color(0xFF007ED4),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['subject']!,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'શિક્ષક: ${item['teacher']} • ${item['room']}',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        item['time']!,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
