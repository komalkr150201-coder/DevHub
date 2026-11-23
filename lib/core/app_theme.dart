import 'package:flutter/material.dart';

class AppColors {
  static const bg = Color(0xFF0A0E24);
  static const bg2 = Color(0xFF0D1230);
  static const card = Color(0xFF111737);
  static const card2 = Color(0xFF171E43);
  static const line = Color(0xFF29315B);
  static const ink = Color(0xFFF0F2FF);
  static const muted = Color(0xFFA3ABD6);
  static const violet = Color(0xFF8B5CF6);
  static const blue = Color(0xFF3B82F6);
  static const sky = Color(0xFF38BDF8);
  static const green = Color(0xFF34D399);
  static const amber = Color(0xFFFBBF24);
  static const red = Color(0xFFF87171);
  static const gradient = LinearGradient(colors: [violet, blue]);
}

class AppTheme {
  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: const ColorScheme.dark(primary: AppColors.violet, secondary: AppColors.sky, surface: AppColors.card),
    fontFamily: 'Roboto',
    appBarTheme: const AppBarTheme(backgroundColor: AppColors.bg, elevation: 0, centerTitle: false, foregroundColor: AppColors.ink),
    cardTheme: CardThemeData(color: AppColors.card, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: AppColors.line))),
    inputDecorationTheme: InputDecorationTheme(
      filled: true, fillColor: AppColors.bg2, hintStyle: const TextStyle(color: AppColors.muted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.line)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.line)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.violet, width: 1.5)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(style: ElevatedButton.styleFrom(backgroundColor: AppColors.violet, foregroundColor: Colors.white, minimumSize: const Size(48, 48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), textStyle: const TextStyle(fontWeight: FontWeight.w700))),
    outlinedButtonTheme: OutlinedButtonThemeData(style: OutlinedButton.styleFrom(foregroundColor: AppColors.ink, side: const BorderSide(color: AppColors.line), minimumSize: const Size(44, 46), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)))),
    textTheme: const TextTheme(
      headlineMedium: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w800, fontSize: 28, letterSpacing: -.5),
      titleLarge: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w700, fontSize: 19),
      titleMedium: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w700, fontSize: 15),
      bodyMedium: TextStyle(color: AppColors.ink, fontSize: 14, height: 1.45),
      bodySmall: TextStyle(color: AppColors.muted, fontSize: 12, height: 1.4),
    ),
    dividerColor: AppColors.line,
    useMaterial3: true,
  );
}
