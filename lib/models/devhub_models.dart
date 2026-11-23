class DevUser {
  final Map<String, dynamic> data;
  DevUser(this.data);
  String get id => '${data['_id'] ?? data['id'] ?? ''}';
  String get username => '${data['username'] ?? ''}';
  String get name => '${data['name'] ?? username}';
  String get email => '${data['email'] ?? ''}';
  String get bio => '${data['bio'] ?? ''}';
  String get headline => '${data['headline'] ?? ''}';
  String get avatarUrl => '${data['avatarUrl'] ?? ''}';
  Map<String, dynamic> get stats => Map<String, dynamic>.from(data['stats'] ?? {});
  List<dynamic> get availability => List<dynamic>.from(data['availability'] ?? []);
  Map<String, dynamic> get links => Map<String, dynamic>.from(data['links'] ?? {});
  Map<String, dynamic> get privacy => Map<String, dynamic>.from(data['privacy'] ?? {});
  String get initials => (name.trim().isEmpty ? 'D' : name.trim().split(RegExp(r'\\s+')).take(2).map((e) => e[0]).join()).toUpperCase();
}

class RepoItem {
  final Map<String, dynamic> data;
  RepoItem(this.data);
  String get id => '${data['_id'] ?? data['id'] ?? ''}';
  String get name => '${data['name'] ?? 'Repository'}';
  String get description => '${data['description'] ?? ''}';
  int get stars => _int(data['stars']);
  int get forks => _int(data['forks']);
  bool get pinned => data['isPinned'] == true || data['pinned'] == true;
  String get url => '${data['url'] ?? ''}';
  List<dynamic> get topics => List<dynamic>.from(data['topics'] ?? []);
}

int _int(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
