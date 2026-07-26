import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'mountains.dart';

void main() {
  runApp(const Mountain100App());
}

class Mountain100App extends StatelessWidget {
  const Mountain100App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mountain100',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2E7D32)),
        useMaterial3: true,
      ),
      home: const MountainListPage(),
    );
  }
}

class MountainListPage extends StatefulWidget {
  const MountainListPage({super.key});

  @override
  State<MountainListPage> createState() => _MountainListPageState();
}

class _MountainListPageState extends State<MountainListPage> {
  static const _prefsKey = 'climbedIds';

  final Set<int> _climbedIds = {};
  String _query = '';
  bool _showOnlyUnclimbed = false;

  @override
  void initState() {
    super.initState();
    _loadClimbed();
  }

  Future<void> _loadClimbed() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getStringList(_prefsKey) ?? [];
    setState(() {
      _climbedIds
        ..clear()
        ..addAll(saved.map(int.parse));
    });
  }

  Future<void> _saveClimbed() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _prefsKey,
      _climbedIds.map((id) => id.toString()).toList(),
    );
  }

  void _toggle(int id) {
    setState(() {
      if (!_climbedIds.remove(id)) {
        _climbedIds.add(id);
      }
    });
    _saveClimbed();
  }

  List<Mountain> get _visibleMountains {
    return mountains.where((m) {
      if (_showOnlyUnclimbed && _climbedIds.contains(m.id)) {
        return false;
      }
      if (_query.isEmpty) {
        return true;
      }
      return m.name.contains(_query) ||
          m.kana.contains(_query) ||
          m.prefecture.contains(_query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final climbedCount = _climbedIds.length;
    final visible = _visibleMountains;

    return Scaffold(
      appBar: AppBar(
        title: const Text('日本百名山'),
        actions: [
          IconButton(
            tooltip: _showOnlyUnclimbed ? 'すべて表示' : '未登頂のみ表示',
            icon: Icon(
              _showOnlyUnclimbed
                  ? Icons.filter_alt
                  : Icons.filter_alt_outlined,
            ),
            onPressed: () {
              setState(() => _showOnlyUnclimbed = !_showOnlyUnclimbed);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '登頂 $climbedCount / ${mountains.length} 座',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: climbedCount / mountains.length,
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: '山名・よみ・都道府県で検索',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              onChanged: (value) => setState(() => _query = value),
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const Center(child: Text('該当する山がありません'))
                : ListView.builder(
                    itemCount: visible.length,
                    itemBuilder: (context, index) {
                      final m = visible[index];
                      final climbed = _climbedIds.contains(m.id);
                      return CheckboxListTile(
                        value: climbed,
                        onChanged: (_) => _toggle(m.id),
                        secondary: CircleAvatar(
                          child: Text('${m.id}'),
                        ),
                        title: Text('${m.name}(${m.kana})'),
                        subtitle: Text('${m.elevation}m ・ ${m.prefecture}'),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
