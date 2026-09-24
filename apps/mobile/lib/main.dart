import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/auth/auth_service.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final isLoggedIn = await AuthService().tryAutoLogin();
  runApp(ProviderScope(child: ApnaSchoolApp(isLoggedIn: isLoggedIn)));
}

class ApnaSchoolApp extends StatelessWidget {
  final bool isLoggedIn;
  const ApnaSchoolApp({super.key, this.isLoggedIn = false});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'શાળા ERP (Apna School)',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF007ED4),
          primary: const Color(0xFF007ED4),
          secondary: const Color(0xFFEEAA00),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.notoSansGujaratiTextTheme(
          Theme.of(context).textTheme,
        ),
        useMaterial3: true,
      ),
      home: isLoggedIn ? const DashboardScreen() : const LoginScreen(),
    );
  }
}
