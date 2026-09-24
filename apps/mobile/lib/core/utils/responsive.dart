import 'package:flutter/material.dart';

class Responsive {
  static bool isPhone(BuildContext context) =>
      MediaQuery.of(context).size.width < 600;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 600 &&
      MediaQuery.of(context).size.width < 1024;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1024;

  static int gridColumns(BuildContext context, {int phoneCols = 2, int tabletCols = 3, int desktopCols = 4}) {
    if (isDesktop(context)) return desktopCols;
    if (isTablet(context)) return tabletCols;
    return phoneCols;
  }

  static double contentMaxWidth(BuildContext context) {
    if (isDesktop(context)) return 1100;
    if (isTablet(context)) return 850;
    return double.infinity;
  }
}
