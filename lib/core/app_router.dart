import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/shell/app_shell.dart';
import '../screens/public/landing_screen.dart';
import '../screens/public/public_profile_screen.dart';

import '../screens/app/template_selector_screen.dart';

class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final name=settings.name ?? '/';
    Widget page;
    if(name=='/login') page=const LoginScreen();
    else if(name=='/signup') page=const SignupScreen();
    else if(name.startsWith('/u/')) page=PublicProfileScreen(username:name.substring(3));
    else if(name=='/templates' || name=='/app/templates') page=const TemplateSelectorScreen();
    else if(name=='/app') page=Consumer<AuthState>(builder:(context,auth,_)=>auth.isAuthenticated?const AppShell():const LoginScreen());
    else page=Consumer<AuthState>(builder:(context,auth,_)=>auth.isAuthenticated?const AppShell():const LandingScreen());
    return MaterialPageRoute(builder:(_)=>page,settings:settings);
  }
}
